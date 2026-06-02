<?php

namespace App\Enums;

enum LoanStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Returned = 'returned';
    case Overdue = 'overdue';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Konfirmasi',
            self::Active => 'Dipinjam',
            self::Returned => 'Dikembalikan',
            self::Overdue => 'Terlambat',
            self::Rejected => 'Ditolak',
            self::Cancelled => 'Dibatalkan',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'amber',
            self::Active => 'blue',
            self::Returned => 'green',
            self::Overdue => 'red',
            self::Rejected => 'red',
            self::Cancelled => 'gray',
        };
    }

    /**
     * Check if loan is in a final state (cannot be changed).
     */
    public function isFinal(): bool
    {
        return in_array($this, [
            self::Returned,
            self::Rejected,
            self::Cancelled,
        ]);
    }

    /**
     * Check if loan is pending confirmation.
     */
    public function isPending(): bool
    {
        return $this === self::Pending;
    }

    /**
     * Check if loan is currently active (borrowed).
     */
    public function isActive(): bool
    {
        return in_array($this, [
            self::Active,
            self::Overdue,
        ]);
    }
}
