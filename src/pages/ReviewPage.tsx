import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, Edit3, Delete, Trash, ChevronDown, ChevronRight, Trophy, CheckCircle2, XCircle, ChartBar } from "lucide-react";
import supabase from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const ReviewPage = () => {
    const [highlights, setHighlights] = useState("");
    const [good, setGood] = useState("");
    const [bad, setBad] = useState("");
    const [health, setHealth] = useState([3]);
    const [relationships, setRelationships] = useState([3]);
    const [progressing, setProgressing] = useState([3]);
    const [work, setWork] = useState([3]);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [highlightsOpen, setHighlightsOpen] = useState(true);
    const [goodOpen, setGoodOpen] = useState(false);
    const [badOpen, setBadOpen] = useState(false);
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
                setHighlights(data.highlights || "");
                setGood(data.good || "");
                setBad(data.bad || "");
                setHealth([data.health || 3]);
                setRelationships([data.relationships || 3]);
                setProgressing([data.progressing || 3]);
                setWork([data.work || 3]);
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
                        good: good.trim(),
                        bad: bad.trim(),
                        health: health[0],
                        relationships: relationships[0],
                        progressing: progressing[0],
                        work: work[0],
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", id);
                error = updateError;
            } else {
                // Create new review
                const { error: insertError } = await supabase.from("reviews").insert([
                    {
                        highlights: highlights.trim(),
                        good: good.trim(),
                        bad: bad.trim(),
                        health: health[0],
                        relationships: relationships[0],
                        progressing: progressing[0],
                        work: work[0],
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
                        <Collapsible open={highlightsOpen} onOpenChange={setHighlightsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                    <label className="text-xl font-semibold cursor-pointer flex items-center gap-2">
                                        <Trophy height={40} width={40} /> Highlights
                                    </label>
                                    {highlightsOpen ? <ChevronDown /> : <ChevronRight />}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 mt-4">
                                <Textarea
                                    id="highlights"
                                    placeholder="Write down your highlights, achievements, or reflections for this review..."
                                    value={highlights}
                                    onChange={(e) => setHighlights(e.target.value)}
                                    className="min-h-[200px] border-none focus:border-none text-gray-700 focus-visible:ring-0 px-0 focus-visible:ring-offset-0"
                                    disabled={loading}
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
                            <CollapsibleContent className="space-y-2 mt-4">
                                <Textarea
                                    id="good"
                                    placeholder="What went well? What are you proud of? What positive experiences did you have?"
                                    value={good}
                                    onChange={(e) => setGood(e.target.value)}
                                    className="min-h-[150px] border-none focus:border-none focus-visible:ring-0 px-0 focus-visible:ring-offset-0"
                                    disabled={loading}
                                />
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible open={badOpen} onOpenChange={setBadOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                    <label className="text-xl font-semibold cursor-pointer flex items-center gap-2">
                                        <XCircle className="h-5 w-5" /> What's Bad?
                                    </label>
                                    {badOpen ? <ChevronDown /> : <ChevronRight />}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 mt-4">
                                <Textarea
                                    id="bad"
                                    placeholder="What didn't go well? What challenges did you face? What would you like to improve?"
                                    value={bad}
                                    onChange={(e) => setBad(e.target.value)}
                                    className="min-h-[150px] border-none focus:border-none focus-visible:ring-0 px-0 focus-visible:ring-offset-0"
                                    disabled={loading}
                                />
                            </CollapsibleContent>
                        </Collapsible>

                        <div className="space-y-6 pt-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <ChartBar /> Metrics
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex font-medium text-gray-500 justify-between items-center">
                                        <label>Health</label>
                                        <span>{health[0]}/5</span>
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
                                    <div className="flex font-medium text-gray-500 justify-between items-center">
                                        <label>Relationships</label>
                                        <span>{relationships[0]}/5</span>
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
                                    <div className="flex font-medium text-gray-500 justify-between items-center">
                                        <label>Progressing</label>
                                        <span>{progressing[0]}/5</span>
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
                                    <div className="flex font-medium text-gray-500 justify-between items-center">
                                        <label>Work</label>
                                        <span>{work[0]}/5</span>
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
                            </div>
                        </div>

                        <div className="flex pt-8 justify-end space-x-3">
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
