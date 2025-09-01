import { useEffect, useState } from "react";
import { Goal } from "../types/goal";
import { supabaseGoalStorage } from "../services/supabaseStorage";
import { supabase } from "../services/supabase";
import { metricSyncService } from "../services/metricSyncService";

export const useSupabaseGoals = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const fetchedGoals = await supabaseGoalStorage.getAllGoals();
            setGoals(fetchedGoals);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch goals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();

        // Set up real-time subscription
        const channel = supabase
            .channel("goals_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "goals",
                },
                () => {
                    // Refetch goals when any change occurs
                    fetchGoals();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addGoal = async (goal: Goal) => {
        try {
            const newGoal = await supabaseGoalStorage.createGoal(goal);
            if (newGoal) {
                setGoals((prev) => [newGoal, ...prev]);
                return newGoal;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add goal");
            return null;
        }
    };

    const updateGoal = async (goal: Goal) => {
        try {
            const updatedGoal = await supabaseGoalStorage.updateGoal(goal);
            if (updatedGoal) {
                setGoals((prev) => prev.map((g) => (g.id === goal.id ? updatedGoal : g)));
                return updatedGoal;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update goal");
            return null;
        }
    };

    const deleteGoal = async (id: string) => {
        try {
            const success = await supabaseGoalStorage.deleteGoal(id);
            if (success) {
                setGoals((prev) => prev.filter((g) => g.id !== id));
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete goal");
            return false;
        }
    };

    const updateSubtasks = async (goalId: string, subtasks: Goal["subtasks"]) => {
        try {
            const success = await supabaseGoalStorage.updateSubtasks(goalId, subtasks || []);
            if (success) {
                setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, subtasks } : g)));
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update subtasks");
            return false;
        }
    };

    const updateProgressLogs = async (goalId: string, progressLogs: Goal["progressLogs"]) => {
        try {
            const success = await supabaseGoalStorage.updateProgressLogs(goalId, progressLogs);
            if (success) {
                setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, progressLogs } : g)));
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update progress logs");
            return false;
        }
    };

    const updateCurrentValue = async (goalId: string, currentValue: number) => {
        try {
            const success = await supabaseGoalStorage.updateCurrentValue(goalId, currentValue);
            if (success) {
                setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, currentValue } : g)));
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update current value");
            return false;
        }
    };

    const syncMetrics = async () => {
        try {
            await metricSyncService.syncMetricsFromReviews();
            await fetchGoals(); // Refresh goals after sync
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to sync metrics");
        }
    };

    return {
        goals,
        loading,
        error,
        addGoal,
        updateGoal,
        deleteGoal,
        updateSubtasks,
        updateProgressLogs,
        updateCurrentValue,
        refetch: fetchGoals,
        syncMetrics,
    };
};
