import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Target, Book } from "lucide-react";

export const TabNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <div className="flex w-full mb-3 justify-between items-center gap-4">
                <div className="flex space-x-1 bg-muted p-1 rounded-lg w-full max-w-md">
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
