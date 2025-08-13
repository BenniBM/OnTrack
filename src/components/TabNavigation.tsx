import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Target, Book } from "lucide-react";

export const TabNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();

    // Only show navigation on main pages
    const shouldShowNavigation = location.pathname === "/" || location.pathname === "/reviews";

    if (!shouldShowNavigation) {
        return null;
    }

    return (
        <div className="w-full px-4 py-3">
            <div className="flex w-full">
                <div className="flex space-x-1 bg-muted p-1 rounded-lg w-full">
                    <button
                        onClick={() => navigate("/")}
                        className={`px-4 py-2 rounded-md text-sm flex items-center justify-center font-medium transition-colors flex-1 ${
                            location.pathname === "/" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}>
                        <Target className="mr-2 h-4 w-4" />
                        Goals
                    </button>
                    <button
                        onClick={() => navigate("/reviews")}
                        className={`px-4 py-2 rounded-md text-sm flex items-center justify-center font-medium transition-colors flex-1 ${
                            location.pathname === "/reviews"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}>
                        <Book className="mr-2 h-4 w-4" />
                        Reviews
                    </button>
                </div>
            </div>
        </div>
    );
};
