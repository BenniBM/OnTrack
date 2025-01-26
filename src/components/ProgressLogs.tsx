import React, { useState } from "react";
import { Trash2, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Goal } from "../types/goal";
import { format } from "date-fns";

interface ProgressLogsProps {
    goal: Goal;
    onUpdateLogs: (updatedGoal: Goal) => void;
}

export const ProgressLogs: React.FC<ProgressLogsProps> = ({ goal, onUpdateLogs }) => {
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number | string>("");

    const handleDeleteLog = (logId: string) => {
        const updatedGoal = {
            ...goal,
            progressLogs: goal.progressLogs.filter((log) => log.id !== logId),
        };

        onUpdateLogs(updatedGoal);
        // toast({
        //     title: "Log Deleted",
        //     description: "Progress log has been removed.",
        //     variant: "destructive",
        // });
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

        const updatedGoal = {
            ...goal,
            progressLogs: goal.progressLogs.map((log) => (log.id === editingLogId ? { ...log, value: numValue } : log)),
        };

        onUpdateLogs(updatedGoal);
        setEditingLogId(null);
        // toast({
        //     title: "Log Updated",
        //     description: "Progress log has been updated.",
        // });
    };

    return (
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
                                        <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="focus:bg-transparent hover:bg-transparent"
                                        size="icon"
                                        onClick={() => setEditingLogId(null)}>
                                        <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="focus:bg-transparent hover:bg-transparent focus:text-black hover:text-black"
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
        </div>
    );
};
