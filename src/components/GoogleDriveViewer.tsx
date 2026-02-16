import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Folder, Image, Video, File, ExternalLink, Camera, LucideCamera, CameraIcon } from "lucide-react";
import { getWeekNumber } from "@/utils/weekUtils";

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime?: string;
    webViewLink?: string;
    webContentLink?: string;
}

interface GoogleDriveViewerProps {
    reviewDate?: Date;
    className?: string;
}

const GoogleDriveViewer = ({ reviewDate, className }: GoogleDriveViewerProps) => {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(true);
    const [currentPath, setCurrentPath] = useState<string>("");

    // Google Drive API configuration
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

    // Your parent folder ID that contains 2025, 2024, etc.
    const PARENT_FOLDER_ID = "14AhTZeRKMncTMKMe-kE_1i2A_C_pErj-";

    useEffect(() => {
        // Load Google API
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
            if (window.gapi) {
                window.gapi.load("client", initializeGapiClient);
            }
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        // Automatically load files when review date changes
        if (reviewDate && window.gapi?.client?.drive) {
            loadFilesForReviewDate();
        }
    }, [reviewDate]);

    const initializeGapiClient = async () => {
        try {
            await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
            console.log("Google Drive API initialized");

            // Auto-load files if we have a review date
            if (reviewDate) {
                loadFilesForReviewDate();
            }
        } catch (error) {
            console.error("Failed to initialize Google Drive API:", error);
            setError("Failed to initialize Google Drive API");
        }
    };

    const loadFilesForReviewDate = async () => {
        if (!reviewDate) return;

        setLoading(true);
        setError(null);

        try {
            const year = reviewDate.getFullYear();
            const week = getWeekNumber(reviewDate);
            const weekStr = `W${week.toString().padStart(2, "0")}`;

            setCurrentPath(`${year}/${weekStr}`);

            // First, find the year folder
            const yearFolder = await findFolderByName(PARENT_FOLDER_ID, year.toString());
            if (!yearFolder) {
                setError(`Year folder ${year} not found`);
                setLoading(false);
                return;
            }

            // Then, find the week folder
            const weekFolder = await findFolderByName(yearFolder.id, weekStr);
            if (!weekFolder) {
                setError(`Week folder ${weekStr} not found in ${year}`);
                setLoading(false);
                return;
            }

            // Finally, list files in the week folder
            await listFilesInFolder(weekFolder.id);
        } catch (err) {
            console.error("Error loading files for review date:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to load files";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const findFolderByName = async (parentId: string, folderName: string): Promise<DriveFile | null> => {
        try {
            const response = await window.gapi.client.drive.files.list({
                q: `'${parentId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                pageSize: 1,
                fields: "files(id, name, mimeType)",
                orderBy: "name",
            });

            return response.result.files?.[0] || null;
        } catch (err) {
            console.error(`Error finding folder ${folderName}:`, err);
            return null;
        }
    };

    const listFilesInFolder = async (folderId: string) => {
        try {
            const response = await window.gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                pageSize: 100,
                fields: "files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink)",
                orderBy: "name",
            });

            console.log("Response:", response);

            const fileList = response.result.files || [];
            setFiles(fileList);

            if (fileList.length === 0) {
                setError("No files found in this week's folder");
            }
        } catch (err) {
            console.error("Error listing files:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to load files";
            setError(errorMessage);
        }
    };

    const formatFileSize = (bytes: string) => {
        const size = parseInt(bytes);
        if (size === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType === "application/vnd.google-apps.folder") return <Folder className="h-4 w-4" />;
        if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
        if (mimeType.startsWith("video/")) return <Video className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    const isImage = (mimeType: string) => mimeType.startsWith("image/");
    const isVideo = (mimeType: string) => mimeType.startsWith("video/");

    const getImageUrl = (file: DriveFile) => {
        return `https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${file.id}`;
    };

    const getVideoUrl = (file: DriveFile) => {
        // Use the embed URL for videos
        return `https://drive.google.com/file/d/${file.id}/preview`;
    };

    const getDirectFileUrl = (file: DriveFile) => {
        // Use webContentLink if available, otherwise fall back to view URL
        return `https://drive.google.com/file/d/${file.id}/view`;
    };

    if (!reviewDate) {
        return null; // Don't show if no review date
    }

    return (
        <div className={className}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <label className="text-xl font-semibold cursor-pointer flex items-center gap-2">
                            <CameraIcon /> Images
                        </label>
                        {isOpen ? <ChevronDown /> : <ChevronRight />}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                    {error && <div className="text-destructive text-sm p-2 bg-destructive/10 rounded">{error}</div>}

                    {loading && (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm text-muted-foreground mt-2">Loading files...</p>
                        </div>
                    )}

                    {files.length > 0 && (
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {files.map((file) => (
                                    <Card key={file.id} className="overflow-hidden">
                                        <CardContent className="p-0">
                                            {isImage(file.mimeType) && (
                                                <div className="aspect-square overflow-hidden">
                                                    <img
                                                        src={getImageUrl(file)}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                                                        loading="lazy"
                                                        onClick={() => window.open(getDirectFileUrl(file), "_blank")}
                                                        onError={(e) => {
                                                            // Fallback to direct URL if thumbnail fails
                                                            const target = e.target as HTMLImageElement;
                                                            // target.src = getDirectFileUrl(file);
                                                        }}
                                                        title="Click to view full size"
                                                    />
                                                </div>
                                            )}
                                            {isVideo(file.mimeType) && (
                                                <div className="aspect-video overflow-hidden bg-muted flex items-center justify-center">
                                                    <iframe
                                                        src={getVideoUrl(file)}
                                                        className="w-full h-full"
                                                        frameBorder="0"
                                                        allowFullScreen
                                                        title={file.name}
                                                    />
                                                </div>
                                            )}
                                            {!isImage(file.mimeType) && !isVideo(file.mimeType) && (
                                                <div className="aspect-square bg-muted flex items-center justify-center">
                                                    {getFileIcon(file.mimeType)}
                                                </div>
                                            )}
                                            <div className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate" title={file.name}>
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{file.size && formatFileSize(file.size)}</p>
                                                        {file.modifiedTime && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(file.modifiedTime).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {file.webViewLink && (
                                                        <a
                                                            href={file.webViewLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:text-primary/80">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

export default GoogleDriveViewer;
