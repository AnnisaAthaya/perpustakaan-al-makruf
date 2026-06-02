import { cn } from '@/lib/utils';

interface LogoProps {
    /** Ukuran logo - preset atau custom number (dalam px) */
    size?: 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Custom className untuk styling tambahan */
    className?: string;
    /** Alt text untuk accessibility (default: "MA Al-Ma'ruf Logo") */
    alt?: string;
}

/**
 * Logo Component - Menampilkan logo MA Al-Ma'ruf dari /public/logo.png
 *
 * Size presets:
 * - sm: 20px (untuk icons kecil, footer)
 * - md: 22px (untuk navbar standard)
 * - lg: 24px (untuk hero sections)
 * - xl: 32px (untuk landing pages)
 */
export default function Logo({ size = 'md', className, alt = "MA Al-Ma'ruf Logo" }: LogoProps) {
    // Convert size preset to pixel value
    const sizeMap = {
        sm: 20,
        md: 22,
        lg: 24,
        xl: 32,
    };

    const pixelSize = typeof size === 'number' ? size : sizeMap[size];

    return (
        <img
            src="/logo.png"
            alt={alt}
            width={pixelSize}
            height={pixelSize}
            className={cn('h-auto w-auto object-contain', className)}
            style={{
                maxWidth: pixelSize,
                maxHeight: pixelSize,
            }}
        />
    );
}
