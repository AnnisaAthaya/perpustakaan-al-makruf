<?php

namespace App\Enums;

enum Language: string
{
    case Indonesia = 'Indonesia';
    case English = 'English';
    case Arabic = 'Arabic';
    case Other = 'Other';

    public function label(): string
    {
        return match ($this) {
            self::Indonesia => 'Indonesia',
            self::English => 'Inggris',
            self::Arabic => 'Arab',
            self::Other => 'Lainnya',
        };
    }
}
