import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date with full date and time (hours:minutes)
 * Output: "15 Jan 2024, 14:30"
 */
export function formatDateTime(dateString: string | Date | null | undefined): string {
    if (!dateString) return '-';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    const formatter = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
    });

    return formatter.format(date);
}

/**
 * Format date with long format and time (for detail pages)
 * Output: "Senin, 15 Januari 2024, 14:30"
 */
export function formatDateTimeLong(dateString: string | Date | null | undefined): string {
    if (!dateString) return '-';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    const formatter = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
    });

    return formatter.format(date);
}

/**
 * Format date only (short format, no time)
 * Output: "15 Jan 2024"
 * Use this for non-critical dates like user registration
 */
export function formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return '-';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    const formatter = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    });

    return formatter.format(date);
}

/**
 * Format date with long format (no time)
 * Output: "Senin, 15 Januari 2024"
 * Use this for non-critical dates in detail views
 */
export function formatDateLong(dateString: string | Date | null | undefined): string {
    if (!dateString) return '-';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    const formatter = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
    });

    return formatter.format(date);
}

/**
 * Returns a solid background Tailwind class for book category.
 * No gradients — single solid color per category.
 */
export function getCategoryColorSolid(category: string): string {
    const colors: Record<string, string> = {
        Sains: 'bg-emerald-700',
        Matematika: 'bg-blue-700',
        'B. Inggris': 'bg-amber-700',
        'B. Indonesia': 'bg-rose-700',
        Sejarah: 'bg-purple-700',
        Agama: 'bg-teal-700',
        Fiksi: 'bg-pink-700',
        Ekonomi: 'bg-orange-700',
        Sosial: 'bg-indigo-700',
        Teknologi: 'bg-cyan-700',
    };
    return colors[category] ?? 'bg-emerald-800';
}

/**
 * Format currency to IDR string.
 * Output: "Rp 2.000"
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}
