<?php

namespace App\Enums;

enum FineStatus: string
{
    case Unpaid = 'unpaid';
    case PendingVerification = 'pending_verification';
    case Paid = 'paid';

    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Belum Bayar',
            self::PendingVerification => 'Menunggu Verifikasi',
            self::Paid => 'Lunas',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Unpaid => 'red',
            self::PendingVerification => 'yellow',
            self::Paid => 'green',
        };
    }
}
