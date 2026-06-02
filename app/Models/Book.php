<?php

namespace App\Models;

use App\Enums\Language;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    /** @use HasFactory<\Database\Factories\BookFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'title',
        'author',
        'publisher',
        'language',
        'description',
        'isbn',
        'stock',
        'available',
        'cover',
        'category_id',
        'location',
        'year',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'language' => Language::class,
            'stock' => 'integer',
            'available' => 'integer',
            'year' => 'integer',
        ];
    }

    /**
     * Get the category of this book.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the loans for this book.
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * Get the users who favorited this book.
     */
    public function favoritedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_favorite_books')
            ->withTimestamps();
    }

    /**
     * Get the users who saved this book.
     */
    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_saved_books')
            ->withTimestamps();
    }

    /**
     * Check if the book is available for borrowing.
     */
    public function isAvailable(): bool
    {
        return $this->available > 0;
    }

    /**
     * Decrease available stock when book is borrowed.
     */
    public function decreaseAvailable(): void
    {
        if ($this->available > 0) {
            $this->decrement('available');
        }
    }

    /**
     * Increase available stock when book is returned.
     */
    public function increaseAvailable(): void
    {
        if ($this->available < $this->stock) {
            $this->increment('available');
        }
    }
}
