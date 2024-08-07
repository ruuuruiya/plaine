import { customAlphabet } from 'nanoid'

// 9-character random string
export const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 9);

// Convert 'YYYY-MM-DD' to 'MMM DD, YYYY'
export function formatDate(date) {
    if (!date) return "";

    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) return "";

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const day = newDate.getDate();

    return `${monthNames[month]} ${day.toString().padStart(2, '0')}, ${year}`;
};

// Calculate User Age
export function calculateAge(date) {
    const birthdate = new Date(date);
    const today = new Date();

    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDifference = today.getMonth() - birthdate.getMonth();

    // If the current month is before the birth month, or it's the same month but the current day is before the birth day
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    };

    return age > 0 ? age : 0;
};
