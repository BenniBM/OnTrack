import React, { useEffect, useState } from "react";
import { Plus, Check, ChartBar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalCard } from "../components/GoalCard";
import { CreateGoalDialog } from "../components/CreateGoalDialog";
import { Goal } from "../types/goal";
import { useToast } from "@/components/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { calculateActualProgress, calculateExpectedProgress } from "@/utils/progressCalculations";
import { useSupabaseGoals } from "../hooks/useSupabaseGoals";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useNavigate, useLocation } from "react-router-dom";

const Index = () => {
    const { goals, loading, error, addGoal } = useSupabaseGoals();
    const { user, loading: authLoading, signOut } = useAuth();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (goals) {
            goals.sort((a, b) => {
                const expectedProgressA = calculateExpectedProgress(a);
                const expectedProgressB = calculateExpectedProgress(b);
                const actualProgressA = calculateActualProgress(a);
                const actualProgressB = calculateActualProgress(b);
                const deltaA = expectedProgressA - actualProgressA;
                const deltaB = expectedProgressB - actualProgressB;
                if (deltaA < deltaB) return 1;
                if (deltaA > deltaB) return -1;
            });
        }
    }, [goals]);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event) => {
            setDeferredPrompt(event);
        };
        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    if (authLoading || loading) return <LoadingSpinner />;
    if (error) return <div className="container py-8 px-4 text-center text-destructive">Error: {error}</div>;
    if (!goals) return null;

    const handleGoalCreate = async (newGoal: Goal) => {
        const result = await addGoal(newGoal);
        if (result) {
            toast({
                title: "Goal Created",
                description: "Your new goal has been created successfully.",
            });
        } else {
            toast({
                title: "Error",
                description: "Failed to create goal. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("User accepted the A2HS prompt");
                } else {
                    console.log("User dismissed the A2HS prompt");
                }
                setDeferredPrompt(null);
            });
        }
    };

    // Separate active, completed, and metric goals
    const activeGoals = goals.filter((goal) => {
        // Exclude metric goals from active goals
        if (goal.metric) return false;

        const isDecreasingGoal = goal.startValue > goal.endValue;
        return isDecreasingGoal ? goal.currentValue > goal.endValue : goal.currentValue < goal.endValue;
    });
    const completedGoals = goals.filter((goal) => !goal.metric && goal.currentValue == goal.endValue);
    const metricGoals = goals.filter((goal) => goal.metric);

    return (
        <div className="container py-4 md:py-8 px-4 md:px-8">
            {/* Active Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {activeGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                ))}
                {activeGoals.length === 0 && (
                    <div className="col-span-full text-center py-8 md:py-12">
                        <h2 className="text-lg md:text-xl font-semibold mb-2">No active goals</h2>
                        <p className="text-muted-foreground">Create a goal to start tracking your progress!</p>
                    </div>
                )}
            </div>

            {/* Metrics Accordion */}
            {metricGoals.length > 0 && (
                <Accordion type="single" collapsible className="w-full mb-6" defaultValue="metrics">
                    <AccordionItem value="metrics">
                        <AccordionTrigger>
                            <div className="flex items-center">
                                <ChartBar className="mr-2 h-4 w-4" />
                                <span className="no-underline">Metrics</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {metricGoals.map((goal) => (
                                    <GoalCard key={goal.id} goal={goal} />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}

            {/* Completed Goals Accordion */}
            {completedGoals.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="completed-goals">
                        <AccordionTrigger>
                            <div className="flex items-center">
                                <Check className="mr-2 h-4 w-4" />
                                <span className="no-underline">Completed Goals</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {completedGoals.map((goal) => (
                                    <GoalCard key={goal.id} goal={goal} />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}

            {/* Floating Action Button for Add Goal */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className="flex">
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Goal
                    </Button>
                    {deferredPrompt && (
                        <Button className="ml-2" onClick={handleInstallClick}>
                            Install App
                        </Button>
                    )}
                </div>
            </div>

            <CreateGoalDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onGoalCreate={handleGoalCreate} />
        </div>
    );
};

export default Index;
