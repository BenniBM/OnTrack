import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Goal } from '../types/goal';
import { calculateActualProgress, calculateExpectedProgress } from '../utils/progressCalculations';
import { differenceInDays, addDays, format } from 'date-fns';

interface ProgressGraphProps {
  goal: Goal;
}

export const ProgressGraph: React.FC<ProgressGraphProps> = ({ goal }) => {
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  const totalDays = differenceInDays(endDate, startDate);
  
  const data = Array.from({ length: totalDays + 1 }, (_, index) => {
    const currentDate = addDays(startDate, index);
    const tempGoal = {
      ...goal,
      endDate: currentDate.toISOString()
    };
    
    return {
      date: format(currentDate, 'MMM dd'),
      expected: calculateExpectedProgress(goal),
      actual: calculateActualProgress(tempGoal)
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="expected"
          stroke="#1EAEDB"
          name="Expected Progress"
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#6B46C1"
          name="Actual Progress"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};