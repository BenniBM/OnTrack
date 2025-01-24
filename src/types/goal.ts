export type GoalType = 'task' | 'numerical';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  startDate: string;
  endDate: string;
  currentValue: number;
  targetValue: number;
  subtasks?: Subtask[];
  description?: string;
}