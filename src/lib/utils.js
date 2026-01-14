import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(date));
}
export function timeAgo(date) {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0)
        return 'Today';
    if (days === 1)
        return '1 day ago';
    if (days < 7)
        return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5)
        return `${weeks} wk${weeks > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} mo${months > 1 ? 's' : ''} ago`;
}
export function currency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
}
