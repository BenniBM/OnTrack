import { Goal } from '../types/goal';

const GOALS_KEY = 'progress_tracker_goals';

export const loadGoals = (): Goal[] => {
  const stored = localStorage.getItem(GOALS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveGoals = (goals: Goal[]) => {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};

export const addGoal = (goal: Goal) => {
  const goals = loadGoals();
  goals.push(goal);
  saveGoals(goals);
};

export const updateGoal = (updatedGoal: Goal) => {
  const goals = loadGoals();
  const index = goals.findIndex(g => g.id === updatedGoal.id);
  if (index !== -1) {
    goals[index] = updatedGoal;
    saveGoals(goals);
  }
};

export const deleteGoal = (goalId: string) => {
  const goals = loadGoals();
  const filtered = goals.filter(g => g.id !== goalId);
  saveGoals(filtered);
};