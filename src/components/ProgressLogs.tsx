import React, { useState } from "react";
import { Trash2, Edit, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Goal } from "../types/goal";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ProgressLogsProps {
    goal: Goal;
    onUpdateLogs: (updatedGoal: Goal) => void;
}

export const ProgressLogs: React.FC<ProgressLogsProps> = ({ goal, onUpdateLogs }) => {
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number | string>("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newLogDate, setNewLogDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [newLogValue, setNewLogValue] = useState<string>("");

    const handleDeleteLog = (logId: string) => {
        const updatedGoal = {
            ...goal,
            progressLogs: goal.progressLogs.filter((log) => log.id !== logId),
        };

        onUpdateLogs(updatedGoal);
    };

    const handleStartEdit = (log: Goal["progressLogs"][0]) => {
        setEditingLogId(log.id);
        setEditValue(log.value.toFixed(1));
    };

    const handleSaveEdit = () => {
        const numValue = Number(editValue);
        if (isNaN(numValue)) {
            toast({
                title: "Invalid Input",
                description: "Please enter a valid number.",
                variant: "destructive",
            });
            return;
        }

        if (numValue < goal.startValue || numValue > goal.endValue) {
            toast({
                title: "Invalid Value",
                description: `Value must be between ${goal.startValue} and ${goal.endValue}.`,
                variant: "destructive",
            });
            return;
        }

        const updatedGoal = {
            ...goal,
            progressLogs: goal.progressLogs.map((log) => (log.id === editingLogId ? { ...log, value: numValue } : log)),
        };

        onUpdateLogs(updatedGoal);
        setEditingLogId(null);
    };

    const handleAddLog = () => {
        const numValue = Number(newLogValue);
        if (isNaN(numValue)) {
            toast({
                title: "Invalid Input",
                description: "Please enter a valid number.",
                variant: "destructive",
            });
            return;
        }

        if (numValue < goal.startValue || numValue > goal.endValue) {
            toast({
                title: "Invalid Value",
                description: `Value must be between ${goal.startValue} and ${goal.endValue}.`,
                variant: "destructive",
            });
            return;
        }

        const newDate = new Date(newLogDate);

        if (newDate < new Date(goal.startDate) || newDate > new Date(goal.endDate)) {
            toast({
                title: "Invalid Date",
                description: `Date must be between ${goal.startDate} and ${goal.endDate}.`,
                variant: "destructive",
            });
            return;
        }

        const existingLog = goal.progressLogs.find(
            (log) => new Date(log.timestamp).toISOString().split("T")[0] === newDate.toISOString().split("T")[0]
        );
        if (existingLog) {
            toast({
                title: "Duplicate Date",
                description: "A log already exists for this date.",
                variant: "destructive",
            });
            return;
        }

        if (newDate > new Date()) {
            toast({
                title: "Future Date",
                description: "Date cannot be in the future.",
                variant: "destructive",
            });
            return;
        }

        const newLog = {
            id: crypto.randomUUID(),
            timestamp: newDate.toISOString(),
            value: numValue,
        };

        const updatedGoal = {
            ...goal,
            progressLogs: [...goal.progressLogs, newLog],
        };

        onUpdateLogs(updatedGoal);
        setIsDialogOpen(false);
        setNewLogValue("");
        setNewLogDate(format(new Date(), "yyyy-MM-dd"));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center"></div>

            <div className="space-y-2">
                {goal.progressLogs
                    .slice()
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="text-left">
                                <div className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "MMM dd")}</div>
                                {editingLogId === log.id ? (
                                    <Input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-24 font-semibold !text-lg mr-2"
                                        min={goal.startValue}
                                        max={goal.endValue}
                                        step="0.1"
                                    />
                                ) : (
                                    <div className="font-semibold text-lg">{log.value.toFixed(1)}</div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                {editingLogId === log.id ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="focus:hover:bg-transparent hover:bg-transparent"
                                            size="icon"
                                            onClick={handleSaveEdit}>
                                            <Check className="h-4 w-4 text-primary" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="focus:bg-transparent hover:bg-transparent"
                                            size="icon"
                                            onClick={() => setEditingLogId(null)}>
                                            <X className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="focus:bg-transparent hover:bg-transparent"
                                            size="icon"
                                            onClick={() => handleStartEdit(log)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="focus:bg-transparent hover:bg-transparent"
                                            size="icon"
                                            onClick={() => handleDeleteLog(log.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <div className="flex w-full text-gray-400 justify-start !mt-3">
                            <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Log
                            </Button>
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Progress Log</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={newLogDate} onChange={(e) => setNewLogDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">
                                    Value (between {goal.startValue} and {goal.endValue})
                                </Label>
                                <Input
                                    id="value"
                                    type="number"
                                    value={newLogValue}
                                    onChange={(e) => setNewLogValue(e.target.value)}
                                    min={goal.startValue}
                                    max={goal.endValue}
                                    step="0.1"
                                />
                            </div>
                            <Button onClick={handleAddLog} className="w-full">
                                Add Log
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
