import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "./LoadingSpinner";
import supabase from "@/lib/supabase";
import { format } from "date-fns";

interface Review {
    id: string;
    highlights: string;
    created_at: string;
}

const ReviewsList = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, []);

    useEffect(() => {
        // Check if we should refresh (e.g., after adding a new review)
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get("refresh") === "true") {
            fetchReviews();
            // Clean up the URL
            window.history.replaceState({}, "", "/reviews");
        }
    }, [location.search]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });

            if (error) {
                throw error;
            }

            setReviews(data || []);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <button onClick={fetchReviews} className="mt-2 text-blue-500 hover:underline">
                    Try again
                </button>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No reviews yet. Start by adding your first review!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 text-left">
            {reviews.map((review) => (
                <Card
                    key={review.id}
                    className="hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/review/${review.id}`)}>
                    <CardHeader className="pb-2 px-4 md:px-6">
                        <CardTitle className="text-2xl md:text-2xl font-bold">Review #{reviews.indexOf(review) + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6">
                        <div className="space-y-2">
                            <Badge variant="secondary">{format(new Date(review.created_at), "MMM dd, yyyy")}</Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ReviewsList;
