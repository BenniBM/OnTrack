import React from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Goal } from "../types/goal";
import { calculateActualProgress, calculateExpectedProgress } from "../utils/progressCalculations";
import { differenceInDays, addDays, format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

export const ProgressGraph: React.FC<ProgressGraphProps> = ({ goal }) => {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const totalDays = differenceInDays(endDate, startDate);

    const data = Array.from({ length: totalDays + 1 }, (_, index) => {
        const currentDate = addDays(startDate, index);
        const tempGoal = {
            ...goal,
            endDate: currentDate.toISOString(),
        };

        return {
            date: format(currentDate, "MMM dd"),
            expected: calculateExpectedProgress(goal),
            actual: calculateActualProgress(tempGoal),
        };
    });

    const currentProgress = calculateActualProgress(goal);
    const expectedProgress = calculateExpectedProgress(goal);
    const progressDiff = (currentProgress - expectedProgress).toFixed(1);
    const isAhead = currentProgress > expectedProgress;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
                <CardDescription>
                    Tracking your progress from {format(startDate, "PP")} to {format(endDate, "PP")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillExpected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-expected)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-expected)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="actual"
                            type="natural"
                            fill="url(#fillActual)"
                            fillOpacity={0.4}
                            stroke="var(--color-actual)"
                            stackId="a"
                        />
                        <Area
                            dataKey="expected"
                            type="natural"
                            fill="url(#fillExpected)"
                            fillOpacity={0.4}
                            stroke="var(--color-expected)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            {isAhead ? "Ahead" : "Behind"} by {Math.abs(Number(progressDiff))}% {isAhead && <TrendingUp className="h-4 w-4" />}
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Current Progress: {currentProgress.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};