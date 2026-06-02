<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryVisit extends Model
{
    protected $fillable = [
        'user_id',
        'visited_at',
        'notes',
    ];

    protected $casts = [
        'visited_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
