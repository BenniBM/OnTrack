import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Goal } from "../types/goal";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(["numerical", "task"] as const, {
        required_error: "Type is required",
    }),
    timeframe: z.enum(["1 Month", "2 Months", "6 Months", "1 Year", "2 Years"], {
        required_error: "Timeframe is required",
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
    update?: boolean;
    existingGoal?: Goal;
}

export const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({ open, onOpenChange, onGoalCreate, update = false, existingGoal }) => {
    const calculateEndDate = (timeframe: string) => {
        const startDate = new Date();
        switch (timeframe) {
            case "1 Month":
                startDate.setMonth(startDate.getMonth() + 1);
                break;
            case "2 Months":
                startDate.setMonth(startDate.getMonth() + 2);
                break;
            case "6 Months":
                startDate.setMonth(startDate.getMonth() + 6);
                break;
            case "1 Year":
                startDate.setFullYear(startDate.getFullYear() + 1);
                break;
            case "2 Years":
                startDate.setFullYear(startDate.getFullYear() + 2);
                break;
        }
        return startDate.toISOString().split("T")[0];
    };

    const form = useForm<GoalFormData>({
        resolver: zodResolver(formSchema),
        defaultValues:
            update && existingGoal
                ? {
                      title: existingGoal.title,
                      type: existingGoal.type,
                      timeframe: "1 Month",
                      startDate: existingGoal.startDate,
                      endDate: existingGoal.endDate,
                      startValue: existingGoal.startValue.toString(),
                      endValue: existingGoal.endValue.toString(),
                  }
                : {
                      title: "",
                      type: "numerical",
                      timeframe: "1 Month",
                      startDate: new Date().toISOString().split("T")[0],
                      endDate: calculateEndDate("1 Month"),
                      startValue: "0",
                      endValue: "100",
                  },
    });

    const handleTimeframeChange = (timeframe: string) => {
        form.setValue("endDate", calculateEndDate(timeframe));
    };

    useEffect(() => {
        if (update && existingGoal) {
            form.reset({
                title: existingGoal.title,
                type: existingGoal.type,
                timeframe: "1 Month",
                startDate: existingGoal.startDate,
                endDate: existingGoal.endDate,
                startValue: existingGoal.startValue.toString(),
                endValue: existingGoal.endValue.toString(),
            });
        }
    }, [update, existingGoal, form]);

    const onSubmit = (data: GoalFormData) => {
        const targetValue = Number(data.endValue) - Number(data.startValue);
        const newGoal: Goal =
            update && existingGoal
                ? {
                      ...existingGoal,
                      title: data.title,
                      startDate: data.startDate,
                      endDate: data.endDate,
                      startValue: Number(data.startValue),
                      endValue: Number(data.endValue),
                      targetValue: targetValue,
                  }
                : {
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
                    <DialogTitle className="text-2xl">{update ? "Update Goal" : "Create New Goal"}</DialogTitle>
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

                        <FormField
                            control={form.control}
                            name="timeframe"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Timeframe</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            handleTimeframeChange(value);
                                        }}
                                        defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select timeframe" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1 Month">1 Month</SelectItem>
                                            <SelectItem value="2 Months">2 Months</SelectItem>
                                            <SelectItem value="6 Months">6 Months</SelectItem>
                                            <SelectItem value="1 Year">1 Year</SelectItem>
                                            <SelectItem value="2 Years">2 Years</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                            {update ? "Update Goal" : "Create Goal"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
