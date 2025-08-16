import { useEffect, useState } from "react";
import { Review, CreateReviewData, UpdateReviewData } from "../types/review";
import { supabaseReviewStorage } from "../services/supabaseReviewStorage";
import { supabase } from "../services/supabase";

export const useSupabaseReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const fetchedReviews = await supabaseReviewStorage.getAllReviews();
            setReviews(fetchedReviews);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();

        // Set up real-time subscription
        const channel = supabase
            .channel("reviews_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "reviews",
                },
                () => {
                    // Refetch reviews when any change occurs
                    fetchReviews();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addReview = async (reviewData: CreateReviewData) => {
        try {
            const newReview = await supabaseReviewStorage.createReview(reviewData);
            if (newReview) {
                setReviews((prev) => [newReview, ...prev]);
                return newReview;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add review");
            return null;
        }
    };

    const updateReview = async (reviewData: UpdateReviewData) => {
        try {
            const updatedReview = await supabaseReviewStorage.updateReview(reviewData);
            if (updatedReview) {
                setReviews((prev) => prev.map((r) => (r.id === reviewData.id ? updatedReview : r)));
                return updatedReview;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update review");
            return null;
        }
    };

    const deleteReview = async (id: string) => {
        try {
            const success = await supabaseReviewStorage.deleteReview(id);
            if (success) {
                setReviews((prev) => prev.filter((r) => r.id !== id));
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete review");
            return false;
        }
    };

    const getReviewById = async (id: string) => {
        try {
            return await supabaseReviewStorage.getReviewById(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch review");
            return null;
        }
    };

    return {
        reviews,
        loading,
        error,
        addReview,
        updateReview,
        deleteReview,
        getReviewById,
        refetch: fetchReviews,
    };
};
