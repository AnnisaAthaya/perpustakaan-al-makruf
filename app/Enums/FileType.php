<?php

namespace App\Enums;

enum FileType: string
{
    case BookCover = 'book_cover';
    case QrisImage = 'qris_image';
    case PaymentProof = 'payment_proof';

    public function disk(): string
    {
        return match ($this) {
            self::BookCover => config('filesystems.disks_by_type.book_cover', 'public'),
            self::QrisImage => config('filesystems.disks_by_type.qris_image', 'public'),
            self::PaymentProof => config('filesystems.disks_by_type.payment_proof', 'public'),
        };
    }

    public function folder(): string
    {
        return match ($this) {
            self::BookCover => 'covers',
            self::QrisImage => 'qris',
            self::PaymentProof => 'payment-proofs',
        };
    }
}
