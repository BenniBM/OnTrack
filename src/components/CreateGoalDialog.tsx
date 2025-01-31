import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Goal } from "../types/goal";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckBig, TrendingUp } from "lucide-react";

// Separate schemas for numerical and task goals
const numericalGoalSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.literal("numerical"),
    timeframe: z.enum(["1 Month", "2 Months", "6 Months", "1 Year", "2 Years"], {
        required_error: "Timeframe is required",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    startValue: z.string().min(1, "Start value is required"),
    endValue: z.string().min(1, "End value is required"),
    unit: z.enum(["kg", "€", "%", "km", "h", "none"], {
        required_error: "Unit is required",
    }),
});

const taskGoalSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.literal("task"),
    timeframe: z.enum(["1 Month", "2 Months", "6 Months", "1 Year", "2 Years"], {
        required_error: "Timeframe is required",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
});

const formSchema = z.discriminatedUnion("type", [numericalGoalSchema, taskGoalSchema]);

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
                      ...(existingGoal.type === "numerical" && {
                          startValue: existingGoal.startValue.toString(),
                          endValue: existingGoal.endValue.toString(),
                          unit: existingGoal.unit || "none",
                      }),
                  }
                : {
                      title: "",
                      type: "numerical",
                      timeframe: "1 Month",
                      startDate: new Date().toISOString().split("T")[0],
                      endDate: calculateEndDate("1 Month"),
                      startValue: "0",
                      endValue: "100",
                      unit: "none",
                  },
    });

    const goalType = form.watch("type");

    const handleTimeframeChange = (timeframe: string) => {
        form.setValue("endDate", calculateEndDate(timeframe));
    };

    const handleTypeChange = (type: "numerical" | "task") => {
        form.setValue("type", type);
        if (type === "task") {
            form.unregister("startValue");
            form.unregister("endValue");
            form.unregister("unit");
        }
    };

    useEffect(() => {
        if (update && existingGoal) {
            form.reset({
                title: existingGoal.title,
                type: existingGoal.type,
                timeframe: "1 Month",
                startDate: existingGoal.startDate,
                endDate: existingGoal.endDate,
                ...(existingGoal.type === "numerical" && {
                    startValue: existingGoal.startValue.toString(),
                    endValue: existingGoal.endValue.toString(),
                    unit: existingGoal.unit || "none",
                }),
            });
        }
    }, [update, existingGoal, form]);

    const onSubmit = (data: GoalFormData) => {
        const newGoal: Goal =
            update && existingGoal
                ? {
                      ...existingGoal,
                      title: data.title,
                      type: data.type,
                      startDate: data.startDate,
                      endDate: data.endDate,
                      ...(data.type === "numerical" && {
                          startValue: Number(data.startValue),
                          endValue: Number(data.endValue),
                          targetValue: Number(data.endValue) - Number(data.startValue),
                          unit: data.unit,
                      }),
                  }
                : {
                      id: crypto.randomUUID(),
                      title: data.title,
                      type: data.type,
                      startDate: data.startDate,
                      endDate: data.endDate,
                      ...(data.type === "numerical"
                          ? {
                                currentValue: Number(data.startValue),
                                startValue: Number(data.startValue),
                                endValue: Number(data.endValue),
                                targetValue: Number(data.endValue) - Number(data.startValue),
                                unit: data.unit,
                            }
                          : {
                                currentValue: 0,
                                startValue: 0,
                                endValue: 0,
                                targetValue: 0,
                                unit: "none",
                                subtasks: [],
                            }),
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
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal Type</FormLabel>
                                    <FormControl>
                                        <ToggleGroup
                                            type="single"
                                            value={field.value}
                                            onValueChange={(value) => {
                                                if (value) handleTypeChange(value as "numerical" | "task");
                                            }}
                                            className="justify-stretch w-full"
                                            defaultValue={field.value} // Set initial focus
                                        >
                                            <ToggleGroupItem
                                                value="numerical"
                                                className="flex-1 border focus:text-slate-950"
                                                aria-label="Toggle numerical">
                                                <TrendingUp className="w-4 h-4 mr-2" />
                                                Numerical
                                            </ToggleGroupItem>
                                            <ToggleGroupItem value="task" className="flex-1 border focus:text-slate-950" aria-label="Toggle task">
                                                <CircleCheckBig className="w-4 h-4 mr-2" />
                                                Tasks
                                            </ToggleGroupItem>
                                        </ToggleGroup>
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

                        {goalType === "numerical" && (
                            <>
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

                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="kg">kg</SelectItem>
                                                    <SelectItem value="€">€</SelectItem>
                                                    <SelectItem value="%">%</SelectItem>
                                                    <SelectItem value="km">km</SelectItem>
                                                    <SelectItem value="h">hours</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <Button type="submit" className="w-full">
                            {update ? "Update Goal" : "Create Goal"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
