import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { GoalCard } from '../components/GoalCard';
import { CreateGoalDialog } from '../components/CreateGoalDialog';
import { Goal } from '../types/goal';
import { loadGoals, saveGoals } from '../services/localStorage';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
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

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Progress Tracker</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
          />
        ))}
        
        {goals.length === 0 && (
          <div className="col-span-full text-center py-8 md:py-12">
            <h2 className="text-lg md:text-xl font-semibold mb-2">No goals yet</h2>
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
    </div>
  );
};

export default Index;