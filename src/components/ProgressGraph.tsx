import React from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Goal } from "../types/goal";
import { differenceInDays, addDays, format, differenceInMilliseconds, isAfter, isBefore, isEqual } from "date-fns";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ProgressGraphProps {
    goal: Goal;
}

const chartConfig = {
    actual: {
        label: "Actual Progress",
        color: "hsl(var(--primary))",
    },
    expected: {
        label: "Expected Progress",
        color: "hsl(var(--muted))",
    },
} satisfies ChartConfig;

const calculateLinearExpectedProgress = (currentDate: Date, startDate: Date, endDate: Date, startValue: number, endValue: number) => {
    const totalDuration = differenceInMilliseconds(endDate, startDate);
    const currentDuration = differenceInMilliseconds(currentDate, startDate);
    const progress = Math.min(1, Math.max(0, currentDuration / totalDuration));
    return startValue + progress * (endValue - startValue);
};

const getProgressValueForDate = (date: Date, progressLogs: Goal["progressLogs"], startValue: number) => {
    // Sort logs by timestamp in ascending order
    const sortedLogs = [...progressLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Find the last log entry that's before or equal to the given date
    const lastValidLog = sortedLogs.reduce((prev, curr) => {
        const currDate = new Date(curr.timestamp);
        if ((isEqual(currDate, date) || isBefore(currDate, date)) && (!prev || isAfter(currDate, new Date(prev.timestamp)))) {
            return curr;
        }
        return prev;
    }, null);

    return lastValidLog ? lastValidLog.value : startValue;
};

export const ProgressGraph: React.FC<ProgressGraphProps> = ({ goal }) => {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const totalDays = differenceInDays(endDate, startDate);

    const data = Array.from({ length: totalDays + 1 }, (_, index) => {
        const currentDate = addDays(startDate, index);
        return {
            date: format(currentDate, "MMM dd"),
            expected: calculateLinearExpectedProgress(currentDate, startDate, endDate, goal.startValue, goal.endValue),
            actual: getProgressValueForDate(currentDate, goal.progressLogs || [], goal.startValue),
        };
    });

    const currentProgress = getProgressValueForDate(new Date(), goal.progressLogs || [], goal.startValue);
    const expectedProgress = calculateLinearExpectedProgress(new Date(), startDate, endDate, goal.startValue, goal.endValue);
    const progressDiff = (currentProgress - expectedProgress).toFixed(1);
    const isAhead = currentProgress > expectedProgress;

    return (
        <div className="space-y-4">
            <div className="text-left">
                <h2 className="text-2xl font-semibold">Progress Overview</h2>
                <p className="text-sm mb-8 text-muted-foreground">
                    Progress from {format(startDate, "PP")} to {format(endDate, "PP")}
                </p>
            </div>
            <div className="relative -mx-4">
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        data={data}
                        margin={{
                            left: 0,
                            right: 8,
                            top: 12,
                            bottom: 12,
                        }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis domain={[goal.startValue, goal.endValue]} hide={false} tickLine={false} axisLine={false} tickMargin={4} width={32} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isAhead ? "#22c55e" : "#ef4444"} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={isAhead ? "#22c55e" : "#ef4444"} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillExpected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1eaedb" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#1eaedb" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="expected"
                            type="monotone"
                            fill="url(#fillExpected)"
                            fillOpacity={0.4}
                            stroke="#1eaedb"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <Area
                            dataKey="actual"
                            type="basis"
                            fill="url(#fillActual)"
                            fillOpacity={0.4}
                            stroke={isAhead ? "#22c55e" : "#ef4444"}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </AreaChart>
                </ChartContainer>
            </div>
            <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                    <div className={`flex items-center gap-2 font-medium leading-none ${isAhead ? "text-green-500" : "text-red-500"}`}>
                        {isAhead ? "Ahead" : "Behind"} by {Math.abs(Number(progressDiff))}% {isAhead && <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div className="flex items-center gap-2 leading-none">Current Progress: {currentProgress.toFixed(1)}%</div>
                </div>
            </div>
        </div>
    );
};
