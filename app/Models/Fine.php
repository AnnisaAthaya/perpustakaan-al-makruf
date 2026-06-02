<?php

namespace App\Models;

use App\Enums\FineStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fine extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'loan_id',
        'amount',
        'late_days',
        'status',
        'payment_proof',
        'submitted_at',
        'verified_at',
        'verified_by',
        'notes',
        'original_amount',
        'adjusted_amount',
        'adjustment_reason',
        'adjusted_by',
        'adjusted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'original_amount' => 'decimal:2',
            'adjusted_amount' => 'decimal:2',
            'late_days' => 'integer',
            'status' => FineStatus::class,
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
            'adjusted_at' => 'datetime',
        ];
    }

    /**
     * Get the loan associated with this fine.
     */
    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * Get the admin who verified this fine.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the admin who adjusted this fine.
     */
    public function adjuster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }

    /**
     * Check if the fine is paid.
     */
    public function isPaid(): bool
    {
        return $this->status === FineStatus::Paid;
    }

    /**
     * Check if the fine is pending verification.
     */
    public function isPendingVerification(): bool
    {
        return $this->status === FineStatus::PendingVerification;
    }

    /**
     * Check if the fine was adjusted by admin.
     */
    public function wasAdjusted(): bool
    {
        return $this->adjusted_amount !== null;
    }

    /**
     * Get the final amount (adjusted or original).
     */
    public function getFinalAmount(): float
    {
        return $this->adjusted_amount ?? $this->original_amount ?? $this->amount;
    }

    /**
     * Submit payment proof.
     */
    public function submitPaymentProof(string $proofPath): void
    {
        $this->update([
            'payment_proof' => $proofPath,
            'status' => FineStatus::PendingVerification,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Verify the payment (approve).
     */
    public function verify(User $admin, ?string $notes = null): void
    {
        $this->update([
            'status' => FineStatus::Paid,
            'verified_at' => now(),
            'verified_by' => $admin->id,
            'notes' => $notes,
        ]);
    }

    /**
     * Reject the payment proof.
     */
    public function reject(User $admin, ?string $notes = null): void
    {
        // Delete payment proof file from storage before rejecting
        if ($this->payment_proof) {
            \App\Services\StorageService::delete($this->payment_proof, \App\Enums\FileType::PaymentProof);
        }

        $this->update([
            'status' => FineStatus::Unpaid,
            'payment_proof' => null,
            'submitted_at' => null,
            'verified_by' => $admin->id,
            'notes' => $notes,
        ]);
    }

    /**
     * Scope to get unpaid fines.
     */
    public function scopeUnpaid($query)
    {
        return $query->where('status', FineStatus::Unpaid);
    }

    /**
     * Scope to get fines pending verification.
     */
    public function scopePendingVerification($query)
    {
        return $query->where('status', FineStatus::PendingVerification);
    }

    /**
     * Scope to get paid fines.
     */
    public function scopePaid($query)
    {
        return $query->where('status', FineStatus::Paid);
    }

    /**
     * Scope to get adjusted fines.
     */
    public function scopeAdjusted($query)
    {
        return $query->whereNotNull('adjusted_amount');
    }
}
