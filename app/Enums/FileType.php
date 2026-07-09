<?php

namespace App\Enums;

enum FileType: string
{
    case BookCover = 'book_cover';
    case QrisImage = 'qris_image';
    case PaymentProof = 'payment_proof';
    case WelcomeHeroImage = 'welcome_hero_image';

    public function disk(): string
    {
        return match ($this) {
            self::BookCover => config('filesystems.disks_by_type.book_cover', 'public'),
            self::QrisImage => config('filesystems.disks_by_type.qris_image', 'public'),
            self::PaymentProof => config('filesystems.disks_by_type.payment_proof', 'public'),
            self::WelcomeHeroImage => config('filesystems.disks_by_type.welcome_hero_image', 'public'),
        };
    }

    public function folder(): string
    {
        return match ($this) {
            self::BookCover => 'covers',
            self::QrisImage => 'qris',
            self::PaymentProof => 'payment-proofs',
            self::WelcomeHeroImage => 'welcome-hero',
        };
    }
}
