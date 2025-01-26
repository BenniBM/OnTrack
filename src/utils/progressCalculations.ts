import { Goal } from "../types/goal";

export const calculateExpectedProgress = (goal: Goal): number => {
    const start = new Date(goal.startDate).getTime();
    const end = new Date(goal.endDate).getTime();
    const now = new Date().getTime();
    const totalRange = goal.endValue - goal.startValue;

    if (now >= end) return goal.endValue;
    if (now <= start) return goal.startValue;

    const totalDuration = end - start;
    const elapsed = now - start;
    const expectedProgress = (elapsed / totalDuration) * totalRange;
    const expectedProgressDelta = expectedProgress - goal.startValue;

    return (expectedProgressDelta / totalRange) * 100;
};

export const calculateActualProgress = (goal: Goal): number => {
    if (goal.type === "task" && goal.subtasks) {
        const completed = goal.subtasks.filter((task) => task.completed).length;
        return (completed / goal.subtasks.length) * 100;
    }

    const totalRange = goal.endValue - goal.startValue;
    const progress = ((goal.currentValue - goal.startValue) / totalRange) * 100;
    return Math.min(100, Math.max(0, progress));
};
