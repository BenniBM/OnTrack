import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit2, History, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Goal, Subtask } from "../types/goal";
import { db } from "../services/storage";
import { ProgressGraph } from "../components/ProgressGraph";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Confetti from "react-canvas-confetti/dist/presets/realistic";
import { TConductorInstance, TPresetInstanceProps } from "react-canvas-confetti/dist/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProgressLogs } from "@/components/ProgressLogs";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { useLiveQuery } from "dexie-react-hooks";

const GoalPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [newTask, setNewTask] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const goals = useLiveQuery(() => db.goals.toArray(), []);
    const goal = goals?.find((g) => g.id === id);
    const [goalState, setGoalState] = useState<Goal | null>(null);

    const [progressValueState, setProgressValue] = useState<number>(0);
    const [actualValueState, setActualValue] = useState<number>(0);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const confettiRef = useRef<TConductorInstance | null>(null);

    useEffect(() => {
        if (goal) {
            const progressValue = ((goal.currentValue - goal.startValue) / (goal.endValue - goal.startValue)) * 100;
            const actualValue = goal.startValue + (progressValue / 100) * (goal.endValue - goal.startValue);
            setProgressValue(progressValue);
            setActualValue(actualValue);
            setSubtasks(goal.subtasks || []);
            setGoalState(goal);
        }
    }, [goal]);

    if (!goals) return null;

    if (!goal) {
        navigate("/");
        return null;
    }

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const newSubtask = {
            id: crypto.randomUUID(),
            title: newTask,
            completed: false,
        };

        const updatedSubtasks = [...subtasks, newSubtask];
        setSubtasks(updatedSubtasks);

        const updatedGoal = {
            ...goal,
            subtasks: updatedSubtasks,
        };
        db.goals.put(updatedGoal);

        setNewTask("");
        toast({
            title: "Task Added",
            description: "New task has been added successfully.",
        });
    };

    const handleLogProgress = (value: number) => {
        const today = new Date().toISOString().split("T")[0];
        const updatedProgressLogs = goal.progressLogs?.filter((log) => new Date(log.timestamp).toISOString().split("T")[0] !== today) || [];

        const newLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            value,
        };

        updatedProgressLogs.push(newLog);

        if (value === goal.endValue) {
            triggerConfetti();
        }

        const updatedGoal = {
            ...goal,
            currentValue: value,
            progressLogs: updatedProgressLogs,
        };

        db.goals.put(updatedGoal);
    };

    const toggleTask = (taskId: string) => {
        const updatedSubtasks = subtasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task));

        setSubtasks(updatedSubtasks);

        const updatedGoal = {
            ...goal,
            subtasks: updatedSubtasks,
        };

        db.goals.put(updatedGoal);
    };

    const handleDelete = () => {
        db.goals.delete(goal.id);
        toast({
            title: "Goal Deleted",
            description: "The goal has been deleted successfully.",
            variant: "destructive",
        });
        navigate("/");
    };

    const handleSliderChange = (value: number) => {
        setProgressValue(value);
        setActualValue(goal.startValue + (value / 100) * (goal.endValue - goal.startValue));
    };

    const triggerConfetti = () => {
        confettiRef.current?.shoot();
    };

    const handleConfettiInit: TPresetInstanceProps["onInit"] = ({ conductor }) => {
        confettiRef.current = conductor;
    };

    const handleGoalUpdate = (updatedGoal: Goal) => {
        const updated = {
            ...goal,
            ...updatedGoal,
        };
        db.goals.put(updated);
    };

    return (
        <div className="container py-4 px-0 md:py-8 max-w-4xl mx-auto">
            <Confetti onInit={handleConfettiInit} width={window.innerWidth} height={window.innerHeight}></Confetti>
            <div className="px-4 md:px-8">
                <div className="flex justify-between items-center">
                    <Button variant="ghost" onClick={() => navigate("/")} className="pl-0 hover:bg-transparent hover:text-muted-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <MoreHorizontal className="mr-2 h-4 w-4" /> Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => {
                                    setUpdateDialogOpen(true);
                                }}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Goal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Goal
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={() => {}}>
                                <Download className="mr-2 h-4 w-4" /> Export CSV
                            </DropdownMenuItem> */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-4 md:space-y-6">
                    <div className="flex flex-row text-left justify-between items-center gap-2 my-8">
                        <h1 className="text-3xl md:text-3xl font-bold">{goal.title}</h1>
                    </div>
                </div>
                <ProgressGraph goal={goalState ? goalState : goal} />

                <div className="mt-20">
                    <div className="flex justify-between items-end mb-4 text-left">
                        <h2 className="text-2xl font-semibold">Log Progress</h2>
                        <span className="text-sm text-muted-foreground">
                            {progressValueState.toFixed(1)}% | {actualValueState.toFixed(1)}
                        </span>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Slider
                                value={[progressValueState]}
                                onValueChange={(value) => handleSliderChange(value[0])}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                        </div>
                        <Button
                            onClick={() => handleLogProgress(goal.startValue + (progressValueState / 100) * (goal.endValue - goal.startValue))}
                            className="w-full">
                            Save Progress
                        </Button>
                    </div>
                </div>

                {goal.type === "task" && (
                    <Card className="p-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-4">Tasks</h2>
                        <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-2 mb-4">
                            <Input placeholder="Add a new task..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="flex-1" />
                            <Button type="submit" className="whitespace-nowrap">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Task
                            </Button>
                        </form>
                        <div className="space-y-2">
                            {subtasks.map((task: Subtask) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-2 p-2 hover:bg-accent/5 rounded-lg cursor-pointer"
                                    onClick={() => toggleTask(task.id)}>
                                    <input type="checkbox" checked={task.completed} onChange={() => {}} className="h-4 w-4" />
                                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Completed Goals Accordion */}
                {goal.progressLogs.length > 0 && (
                    <Accordion type="single" collapsible className="mt-6 w-full">
                        <AccordionItem value="completed-goals">
                            <AccordionTrigger>
                                <div className="flex items-center">
                                    <History className="mr-2 h-4 w-4" />
                                    <span className="no-underline">Progress Logs</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ProgressLogs
                                    goal={goal}
                                    onUpdateLogs={(updatedGoal) => {
                                        handleGoalUpdate(updatedGoal);
                                    }}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this goal? This action cannot be undone.</DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <CreateGoalDialog
                update={true}
                existingGoal={goal}
                open={updateDialogOpen}
                onOpenChange={setUpdateDialogOpen}
                onGoalCreate={handleGoalUpdate}
            />
        </div>
    );
};

export default GoalPage;
