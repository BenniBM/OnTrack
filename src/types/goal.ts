export type GoalType = "task" | "numerical";

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface ProgressLog {
    id: string;
    timestamp: string;
    value: number;
}

export interface Goal {
    id: string;
    title: string;
    type: GoalType;
    startDate: string;
    endDate: string;
    currentValue: number;
    startValue: number;
    endValue: number;
    targetValue: number;
    subtasks?: Subtask[];
    description?: string;
    unit: Unit;
    progressLogs: ProgressLog[];
    metric?: boolean;
}

export type Unit = "kg" | "€" | "%" | "km" | "h" | "none";
