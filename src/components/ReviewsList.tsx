import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "./LoadingSpinner";
import { format } from "date-fns";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";
import { Review } from "@/types/review";
import { getWeekNumber } from "@/utils/weekUtils";

const ReviewsList = () => {
    const { reviews, loading, error, refetch } = useSupabaseReviews();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we should refresh (e.g., after adding a new review)
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get("refresh") === "true") {
            refetch();
            // Clean up the URL
            window.history.replaceState({}, "", "/reviews");
        }
    }, [location.search, refetch]);

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
                <button onClick={refetch} className="mt-2 text-blue-500 hover:underline">
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
            {reviews.map((review) => {
                const reviewDate = new Date(review.createdAt);
                const weekNumber = getWeekNumber(reviewDate);
                const year = reviewDate.getFullYear();

                return (
                    <Card
                        key={review.id}
                        className="hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/review/${review.id}`)}>
                        <CardHeader className="pb-2 px-4 md:px-6">
                            <CardTitle className="text-2xl md:text-2xl font-bold">Week {weekNumber.toString().padStart(2, "0")}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 md:px-6">
                            <div className="space-y-2">
                                <Badge variant="secondary">{format(reviewDate, "dd. MMMM yyyy")}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default ReviewsList;
