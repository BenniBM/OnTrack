import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { GoalCard } from '../components/GoalCard';
import { CreateGoalDialog } from '../components/CreateGoalDialog';
import { ViewGoalDialog } from '../components/ViewGoalDialog';
import { Goal } from '../types/goal';
import { loadGoals, saveGoals, deleteGoal } from '../services/localStorage';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedGoals = loadGoals();
    setGoals(storedGoals);
  }, []);

  const handleGoalCreate = (newGoal: Goal) => {
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
    toast({
      title: "Goal Created",
      description: "Your new goal has been created successfully.",
    });
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setViewDialogOpen(true);
  };

  const handleGoalDelete = (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);
    deleteGoal(goalId);
    setViewDialogOpen(false);
    toast({
      title: "Goal Deleted",
      description: "The goal has been deleted successfully.",
      variant: "destructive",
    });
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Progress Tracker</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onClick={() => handleGoalClick(goal)}
          />
        ))}
        
        {goals.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No goals yet</h2>
            <p className="text-muted-foreground">
              Create your first goal to start tracking your progress!
            </p>
          </div>
        )}
      </div>

      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onGoalCreate={handleGoalCreate}
      />

      {selectedGoal && (
        <ViewGoalDialog
          goal={selectedGoal}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          onDelete={handleGoalDelete}
        />
      )}
    </div>
  );
};

export default Index;