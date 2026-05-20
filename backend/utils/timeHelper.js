/**
 * Helper for time-related calculations
 */

export const getCurrentTimestamp = () => Date.now();

export const getRemainingTime = (expiryTimestamp) => {
    const now = Date.now();
    const diff = expiryTimestamp - now;
    return Math.max(0, Math.ceil(diff / 1000)); // returns seconds
};
