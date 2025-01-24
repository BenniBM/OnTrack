import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Goal, Subtask } from "../types/goal";
import { loadGoals, saveGoals } from "../services/localStorage";
import { ProgressGraph } from "../components/ProgressGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const GoalPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [newTask, setNewTask] = useState("");
    const [progressValue, setProgressValue] = useState<number>(0);

    const goals = loadGoals();
    const goal = goals.find((g) => g.id === id);

    if (!goal) {
        navigate("/");
        return null;
    }

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const updatedGoals = goals.map((g) => {
            if (g.id === goal.id) {
                return {
                    ...g,
                    subtasks: [
                        ...(g.subtasks || []),
                        {
                            id: crypto.randomUUID(),
                            title: newTask,
                            completed: false,
                        },
                    ],
                };
            }
            return g;
        });

        saveGoals(updatedGoals);
        setNewTask("");
        toast({
            title: "Task Added",
            description: "New task has been added successfully.",
        });
        window.location.reload();
    };

    const handleLogProgress = () => {
        const updatedGoals = goals.map((g) => {
            if (g.id === goal.id) {
                return {
                    ...g,
                    currentValue: progressValue,
                    progressLogs: [
                        ...(g.progressLogs || []),
                        {
                            id: crypto.randomUUID(),
                            timestamp: new Date().toISOString(),
                            value: progressValue,
                        },
                    ],
                };
            }
            return g;
        });

        saveGoals(updatedGoals);
        window.location.reload();
    };

    const toggleTask = (taskId: string) => {
        const updatedGoals = goals.map((g) => {
            if (g.id === goal.id) {
                return {
                    ...g,
                    subtasks: g.subtasks?.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
                };
            }
            return g;
        });

        saveGoals(updatedGoals);
        window.location.reload();
    };

    const handleDelete = () => {
        const updatedGoals = goals.filter((g) => g.id !== goal.id);
        saveGoals(updatedGoals);
        toast({
            title: "Goal Deleted",
            description: "The goal has been deleted successfully.",
            variant: "destructive",
        });
        navigate("/");
    };

    return (
        <div className="container py-4 md:py-8 px-4 md:px-8 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 md:mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>

            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col md:flex-row text-left justify-between items-start gap-2 mb-12">
                    <h1 className="text-2xl md:text-3xl font-bold">{goal.title}</h1>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Goal
                    </Button>
                </div>

                <div className="space-y-8">
                    <Card className="p-6">
                        <ProgressGraph goal={goal} />
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Log Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Current Progress</span>
                                        <span>{progressValue}%</span>
                                    </div>
                                    <Slider
                                        value={[progressValue]}
                                        onValueChange={(value) => setProgressValue(value[0])}
                                        max={100}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                                <Button onClick={handleLogProgress} className="w-full">
                                    Save Progress
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {goal.type === "task" && (
                        <Card className="p-6">
                            <h2 className="text-lg md:text-xl font-semibold mb-4">Tasks</h2>
                            <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-2 mb-4">
                                <Input
                                    placeholder="Add a new task..."
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" className="whitespace-nowrap">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Task
                                </Button>
                            </form>
                            <div className="space-y-2">
                                {goal.subtasks?.map((task: Subtask) => (
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
                </div>
            </div>
        </div>
    );
};

export default GoalPage;
