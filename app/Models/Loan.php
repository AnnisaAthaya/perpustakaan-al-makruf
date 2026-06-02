<?php

namespace App\Models;

use App\Enums\FineStatus;
use App\Enums\LoanStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Loan extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'book_id',
        'requested_at',
        'borrowed_at',
        'due_date',
        'returned_at',
        'status',
        'confirmed_at',
        'confirmed_by',
        'rejection_reason',
        'cancellation_reason',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'borrowed_at' => 'datetime',
            'due_date' => 'datetime',
            'returned_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'status' => LoanStatus::class,
        ];
    }

    /**
     * Get the user who borrowed the book.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the book that was borrowed.
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Get the admin who confirmed/rejected the loan.
     */
    public function confirmedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    /**
     * Get the fine for this loan.
     */
    public function fine(): HasOne
    {
        return $this->hasOne(Fine::class);
    }

    /**
     * Check if the loan is pending confirmation.
     */
    public function isPending(): bool
    {
        return $this->status === LoanStatus::Pending;
    }

    /**
     * Check if the loan is currently active (borrowed).
     */
    public function isActive(): bool
    {
        return $this->status === LoanStatus::Active;
    }

    /**
     * Check if the loan is overdue.
     */
    public function isOverdue(): bool
    {
        if (! $this->status->isActive()) {
            return false;
        }

        if (! $this->due_date) {
            return false;
        }

        return Carbon::now()->greaterThan($this->due_date);
    }

    /**
     * Check if the loan can be cancelled by the student.
     */
    public function canBeCancelled(): bool
    {
        return $this->status === LoanStatus::Pending;
    }

    /**
     * Cancel the loan (by student).
     */
    public function cancel(?string $reason = null): void
    {
        if (! $this->canBeCancelled()) {
            throw new \RuntimeException('Peminjaman tidak dapat dibatalkan.');
        }

        $this->status = LoanStatus::Cancelled;
        $this->cancellation_reason = $reason;
        $this->save();

        // Restore book availability
        $this->book->increaseAvailable();
    }

    /**
     * Approve the pending loan request (by admin).
     */
    public function approve(int $adminId): void
    {
        if (! $this->isPending()) {
            throw new \RuntimeException('Peminjaman ini tidak dalam status pending.');
        }

        $loanDays = Setting::getLoanDurationDays();

        $this->update([
            'status' => LoanStatus::Active,
            'borrowed_at' => Carbon::now(),
            'due_date' => Carbon::now()->addDays($loanDays),
            'confirmed_at' => Carbon::now(),
            'confirmed_by' => $adminId,
        ]);
    }

    /**
     * Reject the pending loan request (by admin).
     */
    public function reject(int $adminId, ?string $reason = null): void
    {
        if (! $this->isPending()) {
            throw new \RuntimeException('Peminjaman ini tidak dalam status pending.');
        }

        $this->update([
            'status' => LoanStatus::Rejected,
            'rejection_reason' => $reason,
            'confirmed_at' => Carbon::now(),
            'confirmed_by' => $adminId,
        ]);

        // Restore book availability
        $this->book->increaseAvailable();
    }

    /**
     * Get the number of overdue days.
     */
    protected function overdueDays(): Attribute
    {
        return Attribute::make(
            get: function (): int {
                if (! $this->due_date) {
                    return 0;
                }

                $endDate = $this->returned_at ?? Carbon::now();

                if ($endDate->lessThanOrEqualTo($this->due_date)) {
                    return 0;
                }

                $daysDiff = $this->due_date->diffInDays($endDate);

                // Real-world library practice: minimum 1 day fine if late
                return max(1, (int) ceil($daysDiff));
            }
        );
    }

    /**
     * Get the number of days remaining until due date.
     */
    protected function daysRemaining(): Attribute
    {
        return Attribute::make(
            get: function (): int {
                if (! $this->status->isActive() || ! $this->due_date) {
                    return 0;
                }

                $remaining = Carbon::now()->diffInDays($this->due_date, false);

                return max(0, (int) $remaining);
            }
        );
    }

    /**
     * Get the estimated fine amount.
     */
    protected function estimatedFine(): Attribute
    {
        return Attribute::make(
            get: function (): float {
                $finePerDay = (float) Setting::getValue('fine_per_day', 2000);

                return $this->overdue_days * $finePerDay;
            }
        );
    }

    /**
     * Mark the loan as returned.
     */
    public function markAsReturned(
        ?float $adjustedAmount = null,
        ?string $adjustmentReason = null,
        ?int $adjustedBy = null
    ): void {
        $this->returned_at = Carbon::now();
        $this->status = LoanStatus::Returned;
        $this->save();

        $this->book->increaseAvailable();

        if ($this->overdue_days > 0) {
            $this->createFine($adjustedAmount, $adjustmentReason, $adjustedBy);
        }
    }

    /**
     * Create a fine for this loan.
     */
    public function createFine(
        ?float $adjustedAmount = null,
        ?string $adjustmentReason = null,
        ?int $adjustedBy = null
    ): Fine {
        $finePerDay = (float) Setting::getValue('fine_per_day', 2000);
        $originalAmount = $this->overdue_days * $finePerDay;

        $fineData = [
            'late_days' => $this->overdue_days,
            'status' => FineStatus::Unpaid,
            'original_amount' => $originalAmount,
        ];

        // If admin provided an adjustment
        if ($adjustedAmount !== null && $adjustedAmount != $originalAmount) {
            $fineData['amount'] = $adjustedAmount;
            $fineData['adjusted_amount'] = $adjustedAmount;
            $fineData['adjustment_reason'] = $adjustmentReason;
            $fineData['adjusted_by'] = $adjustedBy;
            $fineData['adjusted_at'] = now();

            // If adjusted to 0, mark as paid immediately
            if ($adjustedAmount == 0) {
                $fineData['status'] = FineStatus::Paid;
            }
        } else {
            // Use original calculated amount
            $fineData['amount'] = $originalAmount;
        }

        return $this->fine()->create($fineData);
    }

    /**
     * Scope to get only pending loans.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', LoanStatus::Pending);
    }

    /**
     * Scope to get only active loans.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', LoanStatus::Active);
    }

    /**
     * Scope to get only overdue loans.
     */
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('status', LoanStatus::Active)
            ->where('due_date', '<', Carbon::now());
    }

    /**
     * Scope to get only returned loans.
     */
    public function scopeReturned(Builder $query): Builder
    {
        return $query->where('status', LoanStatus::Returned);
    }

    /**
     * Scope to get loans that are not in a final state.
     */
    public function scopeOngoing(Builder $query): Builder
    {
        return $query->whereIn('status', [
            LoanStatus::Pending,
            LoanStatus::Active,
            LoanStatus::Overdue,
        ]);
    }
}
