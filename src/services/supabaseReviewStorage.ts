import { Review, CreateReviewData, UpdateReviewData } from "../types/review";
import { supabase } from "./supabase";

export class SupabaseReviewStorage {
    private tableName = "reviews";

    async getAllReviews(): Promise<Review[]> {
        try {
            const { data, error } = await supabase.from(this.tableName).select("*").order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching reviews:", error);
                return [];
            }

            // Transform snake_case to camelCase
            return (data || []).map((review) => ({
                ...review,
                createdAt: review.created_at,
                updatedAt: review.updated_at,
            }));
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return [];
        }
    }

    async getReviewById(id: string): Promise<Review | null> {
        try {
            const { data, error } = await supabase.from(this.tableName).select("*").eq("id", id).single();

            if (error) {
                console.error("Error fetching review:", error);
                return null;
            }

            // Transform snake_case to camelCase
            return {
                ...data,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        } catch (error) {
            console.error("Error fetching review:", error);
            return null;
        }
    }

    async createReview(reviewData: CreateReviewData): Promise<Review | null> {
        try {
            // Transform camelCase to snake_case for database
            const dbReview = {
                highlights: reviewData.highlights,
                good: reviewData.good || null,
                bad: reviewData.bad || null,
                health: reviewData.health || 3,
                relationships: reviewData.relationships || 3,
                progressing: reviewData.progressing || 3,
                work: reviewData.work || 3,
                cash: reviewData.cash || null,
                weight: reviewData.weight || null,
                screentime: reviewData.screentime || null,
            };

            const { data, error } = await supabase.from(this.tableName).insert([dbReview]).select().single();

            if (error) {
                console.error("Error creating review:", error);
                return null;
            }

            // Transform back to camelCase
            return {
                ...data,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        } catch (error) {
            console.error("Error creating review:", error);
            return null;
        }
    }

    async updateReview(reviewData: UpdateReviewData): Promise<Review | null> {
        try {
            const { id, ...updateData } = reviewData;
            const { data, error } = await supabase.from(this.tableName).update(updateData).eq("id", id).select().single();

            if (error) {
                console.error("Error updating review:", error);
                return null;
            }

            // Transform back to camelCase
            return {
                ...data,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        } catch (error) {
            console.error("Error updating review:", error);
            return null;
        }
    }

    async deleteReview(id: string): Promise<boolean> {
        try {
            const { error } = await supabase.from(this.tableName).delete().eq("id", id);

            if (error) {
                console.error("Error deleting review:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error deleting review:", error);
            return false;
        }
    }
}

export const supabaseReviewStorage = new SupabaseReviewStorage();
