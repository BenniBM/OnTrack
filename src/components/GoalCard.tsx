import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from '../types/goal';
import { calculateActualProgress, calculateExpectedProgress } from '../utils/progressCalculations';

interface GoalCardProps {
  goal: Goal;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const navigate = useNavigate();
  const actualProgress = calculateActualProgress(goal);
  const expectedProgress = calculateExpectedProgress(goal);
  
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/goal/${goal.id}`)}
    >
      <CardHeader className="pb-2 px-4 md:px-6">
        <CardTitle className="text-base md:text-lg font-medium">{goal.title}</CardTitle>
        <p className="text-xs md:text-sm text-muted-foreground">
          {goal.type === 'task' ? 'Task-based' : 'Numerical'} Goal
        </p>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs md:text-sm">
            <span>Actual Progress</span>
            <span>{actualProgress.toFixed(1)}%</span>
          </div>
          <Progress value={actualProgress} className="h-2 bg-gray-200" />
          
          <div className="flex justify-between text-xs md:text-sm">
            <span>Expected Progress</span>
            <span>{expectedProgress.toFixed(1)}%</span>
          </div>
          <Progress value={expectedProgress} className="h-2 bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
};