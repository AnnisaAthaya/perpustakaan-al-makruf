<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the books in this category.
     */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }

    /**
     * Get the count of books in this category.
     */
    public function getBooksCountAttribute(): int
    {
        return $this->books()->count();
    }
}
