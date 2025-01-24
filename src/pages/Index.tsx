import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { GoalCard } from '../components/GoalCard';
import { CreateGoalDialog } from '../components/CreateGoalDialog';
import { Goal } from '../types/goal';
import { loadGoals, saveGoals } from '../services/localStorage';

const Index = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const storedGoals = loadGoals();
    setGoals(storedGoals);
  }, []);

  const handleGoalCreate = (newGoal: Goal) => {
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Progress Tracker</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onClick={() => console.log('Goal clicked:', goal.id)}
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
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onGoalCreate={handleGoalCreate}
      />
    </div>
  );
};

export default Index;