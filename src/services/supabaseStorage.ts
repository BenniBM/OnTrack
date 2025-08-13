import { Goal, Subtask, ProgressLog } from "../types/goal";
import { supabase } from "./supabase";

export class SupabaseGoalStorage {
    private tableName = "goals";

    async getAllGoals(): Promise<Goal[]> {
        try {
            const { data, error } = await supabase.from(this.tableName).select("*").order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching goals:", error);
                return [];
            }

            // Transform snake_case to camelCase
            return (data || []).map((goal) => ({
                ...goal,
                startDate: goal.start_date,
                endDate: goal.end_date,
                currentValue: goal.current_value,
                startValue: goal.start_value,
                endValue: goal.end_value,
                targetValue: goal.target_value,
                progressLogs: goal.progress_logs || [],
            }));
        } catch (error) {
            console.error("Error fetching goals:", error);
            return [];
        }
    }

    async getGoalById(id: string): Promise<Goal | null> {
        try {
            const { data, error } = await supabase.from(this.tableName).select("*").eq("id", id).single();

            if (error) {
                console.error("Error fetching goal:", error);
                return null;
            }

            // Transform snake_case to camelCase
            return {
                ...data,
                startDate: data.start_date,
                endDate: data.end_date,
                currentValue: data.current_value,
                startValue: data.start_value,
                endValue: data.end_value,
                targetValue: data.target_value,
                progressLogs: data.progress_logs || [],
            };
        } catch (error) {
            console.error("Error fetching goal:", error);
            return null;
        }
    }

    async createGoal(goal: Goal): Promise<Goal | null> {
        try {
            // Transform camelCase to snake_case for database
            const dbGoal = {
                title: goal.title,
                type: goal.type,
                start_date: goal.startDate,
                end_date: goal.endDate,
                current_value: goal.currentValue,
                start_value: goal.startValue,
                end_value: goal.endValue,
                target_value: goal.targetValue,
                subtasks: goal.subtasks || [],
                description: goal.description,
                unit: goal.unit,
                progress_logs: goal.progressLogs || [],
            };

            const { data, error } = await supabase.from(this.tableName).insert([dbGoal]).select().single();

            if (error) {
                console.error("Error creating goal:", error);
                return null;
            }

            // Transform back to camelCase
            return {
                ...data,
                startDate: data.start_date,
                endDate: data.end_date,
                currentValue: data.current_value,
                startValue: data.start_value,
                endValue: data.end_value,
                targetValue: data.target_value,
                progressLogs: data.progress_logs || [],
            };
        } catch (error) {
            console.error("Error creating goal:", error);
            return null;
        }
    }

    async updateGoal(goal: Goal): Promise<Goal | null> {
        try {
            // Transform camelCase to snake_case for database
            const dbGoal = {
                title: goal.title,
                type: goal.type,
                start_date: goal.startDate,
                end_date: goal.endDate,
                current_value: goal.currentValue,
                start_value: goal.startValue,
                end_value: goal.endValue,
                target_value: goal.targetValue,
                subtasks: goal.subtasks || [],
                description: goal.description,
                unit: goal.unit,
                progress_logs: goal.progressLogs || [],
            };

            const { data, error } = await supabase.from(this.tableName).update(dbGoal).eq("id", goal.id).select().single();

            if (error) {
                console.error("Error updating goal:", error);
                return null;
            }

            // Transform back to camelCase
            return {
                ...data,
                startDate: data.start_date,
                endDate: data.end_date,
                currentValue: data.current_value,
                startValue: data.start_value,
                endValue: data.end_value,
                targetValue: data.target_value,
                progressLogs: data.progress_logs || [],
            };
        } catch (error) {
            console.error("Error updating goal:", error);
            return null;
        }
    }

    async deleteGoal(id: string): Promise<boolean> {
        try {
            const { error } = await supabase.from(this.tableName).delete().eq("id", id);

            if (error) {
                console.error("Error deleting goal:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error deleting goal:", error);
            return false;
        }
    }

    async updateSubtasks(goalId: string, subtasks: Subtask[]): Promise<boolean> {
        try {
            const { error } = await supabase.from(this.tableName).update({ subtasks }).eq("id", goalId);

            if (error) {
                console.error("Error updating subtasks:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error updating subtasks:", error);
            return false;
        }
    }

    async updateProgressLogs(goalId: string, progressLogs: ProgressLog[]): Promise<boolean> {
        try {
            const { error } = await supabase.from(this.tableName).update({ progress_logs: progressLogs }).eq("id", goalId);

            if (error) {
                console.error("Error updating progress logs:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error updating progress logs:", error);
            return false;
        }
    }

    async updateCurrentValue(goalId: string, currentValue: number): Promise<boolean> {
        try {
            const { error } = await supabase.from(this.tableName).update({ current_value: currentValue }).eq("id", goalId);

            if (error) {
                console.error("Error updating current value:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error updating current value:", error);
            return false;
        }
    }
}

export const supabaseGoalStorage = new SupabaseGoalStorage();
