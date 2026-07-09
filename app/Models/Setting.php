<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Cache key prefix for settings.
     */
    private const CACHE_PREFIX = 'setting_';

    /**
     * Cache TTL in seconds (1 hour).
     */
    private const CACHE_TTL = 3600;

    /**
     * Get a setting value by key.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        return Cache::remember(
            self::CACHE_PREFIX.$key,
            self::CACHE_TTL,
            fn () => self::where('key', $key)->value('value') ?? $default
        );
    }

    /**
     * Set a setting value.
     */
    public static function setValue(string $key, mixed $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        Cache::forget(self::CACHE_PREFIX.$key);
    }

    /**
     * Get fine per day setting.
     */
    public static function getFinePerDay(): float
    {
        return (float) self::getValue('fine_per_day', 2000);
    }

    /**
     * Get loan duration in days.
     */
    public static function getLoanDurationDays(): int
    {
        return (int) self::getValue('loan_duration_days', 3);
    }

    /**
     * Get QRIS image path.
     */
    public static function getQrisImage(): ?string
    {
        return self::getValue('qris_image');
    }

    /**
     * Get welcome hero image path.
     */
    public static function getWelcomeHeroImage(): ?string
    {
        return self::getValue('welcome_hero_image');
    }
}
