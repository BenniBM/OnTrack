import React, { useState } from "react";
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
    startValue: z.string().min(1, "Start value is required"),
    endValue: z.string().min(1, "End value is required"),
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
            startValue: "0",
            endValue: "100",
        },
    });

    const onSubmit = (data: GoalFormData) => {
        const targetValue = Number(data.endValue) - Number(data.startValue);
        const newGoal: Goal = {
            id: crypto.randomUUID(),
            title: data.title,
            type: "numerical",
            startDate: data.startDate,
            endDate: data.endDate,
            currentValue: Number(data.startValue),
            startValue: Number(data.startValue),
            endValue: Number(data.endValue),
            targetValue: targetValue,
            subtasks: undefined,
            progressLogs: [],
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Value</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} placeholder="Start Value" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Value</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} placeholder="End Value" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Create Goal
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
