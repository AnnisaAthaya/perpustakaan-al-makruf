<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserFavoriteBook extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'book_id',
    ];

    /**
     * Get the user that favorited the book.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the book that was favorited.
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
