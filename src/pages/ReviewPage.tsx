import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Edit3, Delete, Trash } from "lucide-react";
import supabase from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const ReviewPage = () => {
    const [highlights, setHighlights] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { id } = useParams<{ id: string }>();

    // Load existing review data if editing
    useEffect(() => {
        if (id) {
            setIsEditing(true);
            loadReview();
        }
    }, [id]);

    const loadReview = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.from("reviews").select("*").eq("id", id).single();

            if (error) {
                throw error;
            }

            if (data) {
                setHighlights(data.highlights);
            }
        } catch (error) {
            console.error("Error loading review:", error);
            toast({
                title: "Error",
                description: "Failed to load review. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!highlights.trim()) {
            toast({
                title: "Error",
                description: "Please enter some highlights before saving.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            let error;

            if (isEditing && id) {
                // Update existing review
                const { error: updateError } = await supabase
                    .from("reviews")
                    .update({
                        highlights: highlights.trim(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", id);
                error = updateError;
            } else {
                // Create new review
                const { error: insertError } = await supabase.from("reviews").insert([
                    {
                        highlights: highlights.trim(),
                        created_at: new Date().toISOString(),
                    },
                ]);
                error = insertError;
            }

            if (error) {
                throw error;
            }

            toast({
                title: "Success",
                description: isEditing ? "Review updated successfully!" : "Review saved successfully!",
            });
        } catch (error) {
            console.error("Error saving review:", error);
            toast({
                title: "Error",
                description: `Failed to ${isEditing ? "update" : "save"} review. Please try again.`,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container text-left py-4 md:py-8 px-4 md:px-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <Button variant="ghost" onClick={() => navigate("/reviews")} className="pl-0 hover:bg-transparent hover:text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Button variant="outline">
                    <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
            </div>

            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-row text-left justify-between items-center gap-2 my-8">
                    <h1 className="text-3xl md:text-3xl font-bold">{isEditing ? "Edit Review" : "New Review"}</h1>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label htmlFor="highlights" className="text-2xl font-semibold">
                                Highlights
                            </label>
                            <Textarea
                                id="highlights"
                                placeholder="Write down your highlights, achievements, or reflections for this review..."
                                value={highlights}
                                onChange={(e) => setHighlights(e.target.value)}
                                className="min-h-[200px] border-none focus:border-none focus-visible:ring-0 px-0 focus-visible:ring-offset-0"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => navigate("/reviews")}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving || !highlights.trim()}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? "Saving..." : isEditing ? "Update Review" : "Save Review"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReviewPage;
