import { supabase } from "./supabase";
import { Review } from "../types/review";
import { Goal } from "../types/goal";

interface ReviewMetricData {
    id: string;
    created_at: string;
    cash?: number;
    weight?: number;
    screentime?: number;
}

export class MetricSyncService {
    /**
     * Updates metric goals based on the latest review data
     */
    async syncMetricsFromReviews(): Promise<void> {
        try {
            // Get all reviews with metric data
            const { data: reviews, error: reviewsError } = await supabase
                .from("reviews")
                .select("id, created_at, cash, weight, screentime")
                .order("created_at", { ascending: true });

            if (reviewsError) {
                console.error("Error fetching reviews for metric sync:", reviewsError);
                return;
            }

            // Get metric goals
            const { data: metricGoals, error: goalsError } = await supabase.from("goals").select("*").eq("metric", true);

            if (goalsError) {
                console.error("Error fetching metric goals:", goalsError);
                return;
            }

            // Process each metric goal
            for (const goal of metricGoals) {
                await this.updateMetricGoal(goal, reviews as ReviewMetricData[]);
            }
        } catch (error) {
            console.error("Error syncing metrics:", error);
        }
    }

    /**
     * Updates a specific metric goal based on review data
     */
    private async updateMetricGoal(goal: Goal, reviews: ReviewMetricData[]): Promise<void> {
        try {
            let metricField: string;
            let unit: string;

            // Determine which metric field to use based on goal title
            switch (goal.title) {
                case "Cash":
                    metricField = "cash";
                    unit = "€";
                    break;
                case "Weight":
                    metricField = "weight";
                    unit = "kg";
                    break;
                case "Screen Time":
                    metricField = "screentime";
                    unit = "h";
                    break;
                default:
                    return; // Not a metric goal
            }

            // Filter reviews that have the relevant metric data
            const validReviews = reviews.filter(
                (review) => review[metricField] !== null && review[metricField] !== undefined && review[metricField] > 0
            );

            if (validReviews.length === 0) {
                console.log(`No valid ${metricField} data found in reviews`);
                return;
            }

            // Create progress logs from review data
            const progressLogs = validReviews.map((review) => ({
                id: crypto.randomUUID(),
                timestamp: review.created_at,
                value:
                    metricField === "screentime"
                        ? (review[metricField as keyof ReviewMetricData] as number) / 60
                        : (review[metricField as keyof ReviewMetricData] as number), // Convert screentime to hours
            }));

            // Calculate goal values
            const firstReview = validReviews[0];
            const lastReview = validReviews[validReviews.length - 1];

            const startValue =
                metricField === "screentime"
                    ? (firstReview[metricField as keyof ReviewMetricData] as number) / 60
                    : (firstReview[metricField as keyof ReviewMetricData] as number);
            const endValue =
                metricField === "screentime"
                    ? (lastReview[metricField as keyof ReviewMetricData] as number) / 60
                    : (lastReview[metricField as keyof ReviewMetricData] as number);
            const currentValue = endValue;

            // Update the goal
            const { error } = await supabase
                .from("goals")
                .update({
                    start_value: startValue,
                    end_value: endValue,
                    current_value: currentValue,
                    target_value: endValue,
                    progress_logs: progressLogs,
                    start_date: firstReview.created_at.split("T")[0],
                    end_date: lastReview.created_at.split("T")[0],
                    unit: unit,
                })
                .eq("id", goal.id);

            if (error) {
                console.error(`Error updating ${goal.title} goal:`, error);
            } else {
                console.log(`Successfully updated ${goal.title} goal`);
            }
        } catch (error) {
            console.error(`Error updating metric goal ${goal.title}:`, error);
        }
    }

    /**
     * Syncs metrics after a review is updated
     */
    async syncAfterReviewUpdate(review: Review): Promise<void> {
        // Trigger a full sync to ensure all metrics are up to date
        await this.syncMetricsFromReviews();
    }
}

export const metricSyncService = new MetricSyncService();
