import { CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import ReviewsList from "@/components/ReviewsList";
import { useSupabaseReviews } from "@/hooks/useSupabaseReviews";
import { hasReviewForWeek, getCurrentYear, getCurrentWeekNumber } from "@/utils/weekUtils";

const ReviewsPage = () => {
    const navigate = useNavigate();
    const { reviews } = useSupabaseReviews();
    const currentYear = getCurrentYear();
    const currentWeek = getCurrentWeekNumber();
    const hasCurrentWeekReview = hasReviewForWeek(reviews, currentYear, currentWeek);

    return (
        <div className="container py-4 md:py-8 px-4 md:px-8">
            {/* Reviews List */}
            <ReviewsList />

            {/* Floating Action Button for Add Review */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => navigate("/review")}
                    disabled={hasCurrentWeekReview}
                    title={hasCurrentWeekReview ? `Review for week ${currentWeek} already exists` : "Add new review"}>
                    {hasCurrentWeekReview ? <CheckCircle className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {hasCurrentWeekReview ? "Week Complete" : "Add Review"}
                </Button>
            </div>
        </div>
    );
};

export default ReviewsPage;
