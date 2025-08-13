import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { TabNavigation } from "@/components/TabNavigation";
import ReviewsList from "@/components/ReviewsList";

const ReviewsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="container py-4 md:py-8 px-4 md:px-8">
            {/* Tab Navigation */}
            <TabNavigation />

            {/* Reviews List */}
            <div className="max-w-4xl mx-auto">
                <ReviewsList />
            </div>

            {/* Floating Action Button for Add Review */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button onClick={() => navigate("/review")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Review
                </Button>
            </div>
        </div>
    );
};

export default ReviewsPage;
