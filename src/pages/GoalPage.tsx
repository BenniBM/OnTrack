import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Goal, Subtask } from '../types/goal';
import { loadGoals, saveGoals } from '../services/localStorage';
import { ProgressGraph } from '../components/ProgressGraph';

const GoalPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newTask, setNewTask] = useState('');
  
  const goals = loadGoals();
  const goal = goals.find(g => g.id === id);

  if (!goal) {
    navigate('/');
    return null;
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const updatedGoals = goals.map(g => {
      if (g.id === goal.id) {
        return {
          ...g,
          subtasks: [
            ...(g.subtasks || []),
            {
              id: crypto.randomUUID(),
              title: newTask,
              completed: false
            }
          ]
        };
      }
      return g;
    });

    saveGoals(updatedGoals);
    setNewTask('');
    toast({
      title: "Task Added",
      description: "New task has been added successfully.",
    });
    window.location.reload();
  };

  const toggleTask = (taskId: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id === goal.id) {
        return {
          ...g,
          subtasks: g.subtasks?.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return g;
    });

    saveGoals(updatedGoals);
    window.location.reload();
  };

  const handleDelete = () => {
    const updatedGoals = goals.filter(g => g.id !== goal.id);
    saveGoals(updatedGoals);
    toast({
      title: "Goal Deleted",
      description: "The goal has been deleted successfully.",
      variant: "destructive",
    });
    navigate('/');
  };

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-4 md:mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{goal.title}</h1>
            <p className="text-muted-foreground">
              {format(new Date(goal.startDate), 'PP')} - {format(new Date(goal.endDate), 'PP')}
            </p>
          </div>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Goal
          </Button>
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Progress Overview</h2>
          <div className="h-[300px] md:h-[400px]">
            <ProgressGraph goal={goal} />
          </div>
        </div>

        {goal.type === 'task' && (
          <div className="bg-card rounded-lg p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Tasks</h2>
            <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-2 mb-4">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </form>
            <div className="space-y-2">
              {goal.subtasks?.map((task: Subtask) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 hover:bg-accent/5 rounded-lg cursor-pointer"
                  onClick={() => toggleTask(task.id)}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />
                  <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalPage;