import React from 'react';
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Goal, GoalType } from '../types/goal';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreate: (goal: Goal) => void;
}

interface GoalFormData {
  title: string;
  type: GoalType;
  startDate: string;
  endDate: string;
  targetValue: string;
}

export const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({
  open,
  onOpenChange,
  onGoalCreate,
}) => {
  const form = useForm<GoalFormData>({
    defaultValues: {
      title: '',
      type: 'numerical',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      targetValue: '100',
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
      subtasks: data.type === 'task' ? [] : undefined,
    };
    
    onGoalCreate(newGoal);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
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
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="numerical">Numerical</SelectItem>
                      <SelectItem value="task">Task-based</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
            
            <Button type="submit" className="w-full">Create Goal</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};