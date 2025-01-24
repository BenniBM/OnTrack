import { Goal } from '../types/goal';

export const calculateExpectedProgress = (goal: Goal): number => {
  const start = new Date(goal.startDate).getTime();
  const end = new Date(goal.endDate).getTime();
  const now = new Date().getTime();
  
  if (now >= end) return 100;
  if (now <= start) return 0;
  
  const totalDuration = end - start;
  const elapsed = now - start;
  
  return Math.min(100, (elapsed / totalDuration) * 100);
};

export const calculateActualProgress = (goal: Goal): number => {
  if (goal.type === 'task' && goal.subtasks) {
    const completed = goal.subtasks.filter(task => task.completed).length;
    return (completed / goal.subtasks.length) * 100;
  }
  
  // For numerical goals
  const progress = ((goal.currentValue / goal.targetValue) * 100);
  return Math.min(100, Math.max(0, progress));
};