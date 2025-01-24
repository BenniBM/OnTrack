import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Goal } from "../types/goal";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(["numerical", "task"] as const, {
        required_error: "Type is required",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    targetValue: z.string().min(1, "Target value is required"),
});

type GoalFormData = z.infer<typeof formSchema>;

interface CreateGoalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGoalCreate: (goal: Goal) => void;
}

export const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({ open, onOpenChange, onGoalCreate }) => {
    const form = useForm<GoalFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            type: "numerical",
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            targetValue: "100",
        },
    });

    const onSubmit = (data: GoalFormData) => {
        const newGoal: Goal = {
            id: crypto.randomUUID(),
            title: data.title,
            type: data.type,
            startDate: data.startDate,
            endDate: data.endDate,
            currentValue: 0,
            targetValue: Number(data.targetValue),
            subtasks: data.type === "task" ? [] : undefined,
        };

        onGoalCreate(newGoal);
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Goal</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter goal title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="targetValue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Value</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            Create Goal
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
