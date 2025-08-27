/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash, ChevronDown, ChevronRight, Trophy, CheckCircle2, XCircle, ChartBar, X, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";
import { CreateReviewData, UpdateReviewData } from "@/types/review";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { formatYearWeek } from "@/utils/weekUtils";

const ReviewPage = () => {
    const [highlights, setHighlights] = useState("");
    const [good, setGood] = useState("");
    const [bad, setBad] = useState("");
    const [health, setHealth] = useState([3]);
    const [relationships, setRelationships] = useState([3]);
    const [progressing, setProgressing] = useState([3]);
    const [work, setWork] = useState([3]);
    const [cash, setCash] = useState("");
    const [weight, setWeight] = useState("");
    const [screentime, setScreentime] = useState("");
    const [screentimeHours, setScreentimeHours] = useState("");
    const [screentimeMinutes, setScreentimeMinutes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [highlightsOpen, setHighlightsOpen] = useState(true);
    const [goodOpen, setGoodOpen] = useState(true);
    const [badOpen, setBadOpen] = useState(true);
    const [metricsOpen, setMetricsOpen] = useState(true);
    const [numbersOpen, setNumbersOpen] = useState(true);
    const [createdAt, setCreatedAt] = useState<Date | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { id } = useParams<{ id: string }>();
    const { addReview, updateReview, deleteReview, getReviewById, loading: hookLoading } = useSupabaseReviews();

    // Helper function to convert dashes to bullet points
    const convertDashesToBullets = (text: string) => {
        return text.replace(/-/g, "•");
    };

    // Helper function to adjust textarea height
    const adjustTextareaHeight = (elementId: string, content: string) => {
        const textarea = document.getElementById(elementId) as HTMLTextAreaElement;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.max(70, textarea.scrollHeight) + "px";
        }
    };

    // Helper function to handle textarea input height adjustment
    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        const newHeight = Math.max(70, target.scrollHeight);
        if (Math.abs(parseInt(target.style.height || "0") - newHeight) > 5) {
            target.style.height = newHeight + "px";
        }
    };

    // Load existing review data if editing
    useEffect(() => {
        if (id) {
            setIsEditing(true);
            loadReview();
        }
    }, [id]);

    // Adjust textarea heights when content changes
    useEffect(() => {
        adjustTextareaHeight("highlights", highlights);
        adjustTextareaHeight("good", good);
        adjustTextareaHeight("bad", bad);
    }, [highlights, good, bad]);

    // Recalculate heights when collapsible sections are opened (to fix scrollable issue)
    useEffect(() => {
        const sections = [
            { isOpen: highlightsOpen, id: "highlights", content: highlights },
            { isOpen: goodOpen, id: "good", content: good },
            { isOpen: badOpen, id: "bad", content: bad },
        ];

        sections.forEach(({ isOpen, id, content }) => {
            if (isOpen) {
                requestAnimationFrame(() => adjustTextareaHeight(id, content));
            }
        });
    }, [highlightsOpen, goodOpen, badOpen, highlights, good, bad]);

    // Handle initial height calculation after component is fully mounted and data is loaded
    useEffect(() => {
        if (!loading && highlights) {
            // Single calculation after everything is ready
            const timeoutId = setTimeout(() => {
                if (highlightsOpen) adjustTextareaHeight("highlights", highlights);
                if (goodOpen) adjustTextareaHeight("good", good);
                if (badOpen) adjustTextareaHeight("bad", bad);
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [loading, highlights, good, bad, highlightsOpen, goodOpen, badOpen]);

    const loadReview = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const review = await getReviewById(id);

            if (review) {
                setCreatedAt(new Date(review.createdAt));
                setHighlights(review.highlights || "");
                setGood(review.good || "");
                setBad(review.bad || "");
                setHealth([review.health || 3]);
                setRelationships([review.relationships || 3]);
                setProgressing([review.progressing || 3]);
                setWork([review.work || 3]);
                setCash(review.cash?.toString() || "");
                setWeight(review.weight?.toString() || "");
                setScreentime(review.screentime?.toString() || "");
                if (review.screentime) {
                    setScreentimeHours(Math.floor(review.screentime / 60).toString());
                    setScreentimeMinutes((review.screentime % 60).toString());
                } else {
                    setScreentimeHours("");
                    setScreentimeMinutes("");
                }
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
            let result;

            if (isEditing && id) {
                // Update existing review
                const updateData: UpdateReviewData = {
                    id,
                    highlights: highlights.trim(),
                    good: good.trim() || undefined,
                    bad: bad.trim() || undefined,
                    health: health[0],
                    relationships: relationships[0],
                    progressing: progressing[0],
                    work: work[0],
                    cash: cash.trim() ? parseFloat(cash) : undefined,
                    weight: weight.trim() ? parseFloat(weight) : undefined,
                    screentime:
                        screentimeHours.trim() || screentimeMinutes.trim()
                            ? parseInt(screentimeHours || "0") * 60 + parseInt(screentimeMinutes || "0")
                            : undefined,
                };
                result = await updateReview(updateData);
            } else {
                // Create new review
                const createData: CreateReviewData = {
                    highlights: highlights.trim(),
                    good: good.trim() || undefined,
                    bad: bad.trim() || undefined,
                    health: health[0],
                    relationships: relationships[0],
                    progressing: progressing[0],
                    work: work[0],
                    cash: cash.trim() ? parseFloat(cash) : undefined,
                    weight: weight.trim() ? parseFloat(weight) : undefined,
                    screentime:
                        screentimeHours.trim() || screentimeMinutes.trim()
                            ? parseInt(screentimeHours || "0") * 60 + parseInt(screentimeMinutes || "0")
                            : undefined,
                };
                result = await addReview(createData);
            }

            if (result) {
                console.log(result);
            } else {
                throw new Error("Failed to save review");
            }
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

    const handleDelete = async () => {
        if (!id || !isEditing) return;

        setIsSaving(true);
        try {
            const success = await deleteReview(id);
            if (success) {
                toast({
                    title: "Success",
                    description: "Review deleted successfully!",
                });
                navigate("/reviews");
            } else {
                throw new Error("Failed to delete review");
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            toast({
                title: "Error",
                description: "Failed to delete review. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || hookLoading) return <LoadingSpinner />;

    return (
        <div className="container text-left py-4 md:py-8 px-4 md:px-8 mb-20 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <Button variant="ghost" onClick={() => navigate("/reviews")} className="pl-0 hover:bg-transparent hover:text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Badge variant="secondary">{isEditing ? formatYearWeek(createdAt) : "New Review"}</Badge>
            </div>

            <div className="space-y-4">
                <Collapsible open={highlightsOpen} onOpenChange={setHighlightsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                            <label className="text-xl font-semibold cursor-pointer flex items-center gap-2">
                                <Trophy height={40} width={40} /> Highlights
                            </label>
                            {highlightsOpen ? <ChevronDown /> : <ChevronRight />}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mb-6 mt-2">
                        <Textarea
                            id="highlights"
                            placeholder="Write down your highlights, achievements, or reflections for this review..."
                            value={highlights}
                            onChange={(e) => setHighlights(convertDashesToBullets(e.target.value))}
                            className="min-h-[200px] border-none focus:border-none text-gray-700 focus-visible:ring-0 px-0 focus-visible:ring-offset-0 resize-none"
                            disabled={loading}
                            rows={Math.max(2, highlights.split("\n").length)}
                            style={{ height: "auto", minHeight: "70px" }}
                            onInput={handleTextareaInput}
                        />
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible open={goodOpen} onOpenChange={setGoodOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                            <label className="font-semibold text-xl cursor-pointer flex items-center gap-2">
                                <CheckCircle2 /> What's Good?
                            </label>
                            {goodOpen ? <ChevronDown /> : <ChevronRight />}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mb-6 mt-2">
                        <Textarea
                            id="good"
                            placeholder="What went well? What are you proud of? What positive experiences did you have?"
                            value={good}
                            onChange={(e) => setGood(convertDashesToBullets(e.target.value))}
                            className="min-h-[150px] border-none focus:border-none focus-visible:ring-0 px-0 focus-visible:ring-offset-0 resize-none"
                            disabled={loading}
                            rows={Math.max(2, good.split("\n").length)}
                            style={{ height: "auto", minHeight: "70px" }}
                            onInput={handleTextareaInput}
                        />
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible open={badOpen} onOpenChange={setBadOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                            <label className="text-xl font-semibold cursor-pointer flex items-center gap-2">
                                <XCircle /> What's Bad?
                            </label>
                            {badOpen ? <ChevronDown /> : <ChevronRight />}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mb-6 mt-2">
                        <Textarea
                            id="bad"
                            placeholder="What didn't go well? What challenges did you face? What would you like to improve?"
                            value={bad}
                            onChange={(e) => setBad(convertDashesToBullets(e.target.value))}
                            className="min-h-[150px] border-none focus:border-none focus-visible:ring-0 px-0 focus-visible:ring-offset-0 resize-none"
                            disabled={loading}
                            rows={Math.max(2, bad.split("\n").length)}
                            style={{ height: "auto", minHeight: "70px" }}
                            onInput={handleTextareaInput}
                        />
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible open={metricsOpen} onOpenChange={setMetricsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                            <label className="text-xl font-semibold cursor-pointer flex items-center gap-2">
                                <Activity /> General
                            </label>
                            {metricsOpen ? <ChevronDown /> : <ChevronRight />}
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-2 mt-6 mb-16">
                        <div className="space-y-2">
                            <div className="flex font-medium text-gray-500 text-sm justify-between items-center">
                                <label>Health</label>
                                <span className="text-xs">{health[0]}/5</span>
                            </div>
                            <Slider
                                color="bg-green-500"
                                value={health}
                                onValueChange={setHealth}
                                max={5}
                                min={1}
                                step={1}
                                className="w-full"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex text-sm font-medium text-gray-500 justify-between items-center">
                                <label>Relationships</label>
                                <span className="text-xs">{relationships[0]}/5</span>
                            </div>
                            <Slider
                                color="bg-yellow-500"
                                value={relationships}
                                onValueChange={setRelationships}
                                max={5}
                                min={1}
                                step={1}
                                className="w-full"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex text-sm font-medium text-gray-500 justify-between items-center">
                                <label>Progressing</label>
                                <span className="text-xs">{progressing[0]}/5</span>
                            </div>
                            <Slider
                                color="bg-blue-500"
                                value={progressing}
                                onValueChange={setProgressing}
                                max={5}
                                min={1}
                                step={1}
                                className="w-full"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex text-sm font-medium text-gray-500 justify-between items-center">
                                <label>Work</label>
                                <span className="text-xs">{work[0]}/5</span>
                            </div>
                            <Slider
                                color="bg-red-500"
                                value={work}
                                onValueChange={setWork}
                                max={5}
                                min={1}
                                step={1}
                                className="w-full"
                                disabled={loading}
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible open={numbersOpen} onOpenChange={setNumbersOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                            <label className="text-xl font-semibold cursor-pointer flex items-center gap-2">
                                <ChartBar /> Numbers
                            </label>
                            {numbersOpen ? <ChevronDown /> : <ChevronRight />}
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-4 mt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Cash (€)</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={cash}
                                onChange={(e) => setCash(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Weight (kg)</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Screentime</label>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={screentimeHours}
                                        onChange={(e) => setScreentimeHours(e.target.value)}
                                        disabled={loading}
                                    />
                                    <label className="text-xs text-gray-400 block mt-1">Hours</label>
                                </div>
                                <div className="w-1/2">
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={screentimeMinutes}
                                        onChange={(e) => setScreentimeMinutes(e.target.value)}
                                        disabled={loading}
                                    />
                                    <label className="text-xs text-gray-400 block mt-1">Minutes</label>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <div className="fixed bottom-0 md:max-w-4xl mx-auto md:border-t-0 left-0 right-0 bg-white p-4 border-t">
                    <div className="flex justify-center gap-x-3">
                        {isEditing ? (
                            <>
                                <Button className="w-1/2" variant="outline" onClick={() => setDeleteDialogOpen(true)}>
                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                </Button>
                                <Button className="w-1/2" onClick={handleSave} disabled={isSaving || !highlights.trim()}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save
                                </Button>
                            </>
                        ) : (
                            <Button className="w-full" onClick={handleSave} disabled={isSaving || !highlights.trim()}>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this review? This action cannot be undone.</DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReviewPage;
