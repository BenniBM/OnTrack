/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Get the ISO week number for a given date
 * @param date - The date to get the week number for
 * @returns The ISO week number (1-53)
 */
export const getWeekNumber = (date: Date): number => {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    // January 4 is always in week 1
    const week1 = new Date(d.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1
    const weekNumber = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return weekNumber;
};

/**
 * Get the current week number
 * @returns The current ISO week number
 */
export const getCurrentWeekNumber = (): number => {
    return getWeekNumber(new Date());
};

/**
 * Get the current year
 * @returns The current year
 */
export const getCurrentYear = (): number => {
    return new Date().getFullYear();
};

/**
 * Check if a review exists for a specific week
 * @param reviews - Array of reviews
 * @param year - The year to check
 * @param week - The week number to check
 * @returns True if a review exists for that week, false otherwise
 */
export const hasReviewForWeek = (reviews: any[], year: number, week: number): boolean => {
    return reviews.some((review) => {
        const reviewDate = new Date(review.createdAt);
        const reviewYear = reviewDate.getFullYear();
        const reviewWeek = getWeekNumber(reviewDate);
        return reviewYear === year && reviewWeek === week;
    });
};

/**
 * Format a date to show year and week number
 * @param date - The date to format
 * @returns Formatted string like "2025, W33"
 */
export const formatYearWeek = (date: Date): string => {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}, W${week.toString().padStart(2, "0")}`;
};
