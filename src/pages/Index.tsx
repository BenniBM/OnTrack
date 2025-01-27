import React, { useEffect, useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalCard } from "../components/GoalCard";
import { CreateGoalDialog } from "../components/CreateGoalDialog";
import { Goal } from "../types/goal";
import { db } from "../services/storage";
import { useToast } from "@/components/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { calculateActualProgress, calculateExpectedProgress } from "@/utils/progressCalculations";
import { useLiveQuery } from "dexie-react-hooks";

const Index = () => {
    const goals = useLiveQuery(() => db.goals.toArray(), []);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const { toast } = useToast();

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

    if (!goals) return null;

    const handleGoalCreate = (newGoal: Goal) => {
        db.goals.add(newGoal);
        toast({
            title: "Goal Created",
            description: "Your new goal has been created successfully.",
        });
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

    // Separate active and completed goals
    const activeGoals = goals.filter((goal) => {
        const isDecreasingGoal = goal.startValue > goal.endValue;
        return isDecreasingGoal ? goal.currentValue > goal.endValue : goal.currentValue < goal.endValue;
    });
    const completedGoals = goals.filter((goal) => goal.currentValue == goal.endValue);

    return (
        <div className="container py-4 md:py-8 px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">Progress Tracker</h1>
                <div className="flex gap-2">
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Goal
                    </Button>
                    {deferredPrompt && <Button onClick={handleInstallClick}>Install App</Button>}
                </div>
            </div>

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

            <CreateGoalDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onGoalCreate={handleGoalCreate} />
        </div>
    );
};

export default Index;
