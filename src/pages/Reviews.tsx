import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { TabNavigation } from "@/components/TabNavigation";

const ReviewsPage = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="container py-4 md:py-8 px-4 md:px-8">
            {/* Tab Navigation */}
            <TabNavigation />

            <div className="text-center py-12">
                <h1 className="text-3xl font-bold mb-4">Reviews</h1>
                <p className="text-muted-foreground">This page is coming soon...</p>
            </div>
        </div>
    );
};

export default ReviewsPage;
