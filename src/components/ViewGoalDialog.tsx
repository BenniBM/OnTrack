import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { Goal } from '../types/goal';
import { format } from 'date-fns';

interface ViewGoalDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (goalId: string) => void;
}

export const ViewGoalDialog: React.FC<ViewGoalDialogProps> = ({
  goal,
  open,
  onOpenChange,
  onDelete,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{goal.title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p><strong>Type:</strong> {goal.type === 'task' ? 'Task-based' : 'Numerical'}</p>
            <p><strong>Start Date:</strong> {format(new Date(goal.startDate), 'PP')}</p>
            <p><strong>End Date:</strong> {format(new Date(goal.endDate), 'PP')}</p>
            {goal.type === 'numerical' && (
              <>
                <p><strong>Current Value:</strong> {goal.currentValue}</p>
                <p><strong>Target Value:</strong> {goal.targetValue}</p>
              </>
            )}
            {goal.type === 'task' && goal.subtasks && (
              <div>
                <strong>Subtasks:</strong>
                <ul className="list-disc pl-4 mt-2">
                  {goal.subtasks.map(subtask => (
                    <li key={subtask.id} className={subtask.completed ? 'line-through' : ''}>
                      {subtask.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-between items-center">
          <Button
            variant="destructive"
            onClick={() => onDelete(goal.id)}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Goal
          </Button>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};