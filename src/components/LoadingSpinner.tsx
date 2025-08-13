import React, { useState, useEffect } from "react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", className = "" }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(true);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${className}`}>
            <div className="flex flex-col items-center space-y-4">
                <div className={`${sizeClasses[size]} relative`}>
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>

                    {/* Animated ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>

                    {/* Inner dot */}
                    <div className="absolute inset-2 rounded-full bg-blue-500 animate-pulse"></div>
                </div>

                {/* Loading text */}
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait while we fetch your data</p>
                </div>

                {/* Animated dots */}
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
            </div>
        </div>
    );
};
