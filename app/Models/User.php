<?php

namespace App\Models;

use App\Enums\LoanStatus;
use App\Enums\MembershipStatus;
use App\Enums\UserRole;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'nis',
        'email',
        'password',
        'password_changed_at',
        'role',
        'phone',
        'grade',
        'class_name',
        'date_of_birth',
        'address',
        'avatar',
        'membership_status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'password_changed_at' => 'datetime',
            'date_of_birth' => 'date',
            'role' => UserRole::class,
            'membership_status' => MembershipStatus::class,
            'grade' => 'integer',
        ];
    }

    /**
     * Get the user's loans.
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * Get the user's active loans.
     */
    public function activeLoans(): HasMany
    {
        return $this->hasMany(Loan::class)->where('status', LoanStatus::Active);
    }

    /**
     * Get the user's fines that were verified by this admin.
     */
    public function verifiedFines(): HasMany
    {
        return $this->hasMany(Fine::class, 'verified_by');
    }

    /**
     * Get the books favorited by this user.
     */
    public function favoriteBooks(): BelongsToMany
    {
        return $this->belongsToMany(Book::class, 'user_favorite_books')
            ->withTimestamps();
    }

    /**
     * Get the books saved by this user.
     */
    public function savedBooks(): BelongsToMany
    {
        return $this->belongsToMany(Book::class, 'user_saved_books')
            ->withTimestamps();
    }

    /**
     * Get the user's library visits.
     */
    public function visits(): HasMany
    {
        return $this->hasMany(LibraryVisit::class);
    }

    /**
     * Get the full class display name (e.g., "XII IPA 1").
     */
    protected function fullClass(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                if (! $this->grade) {
                    return null;
                }

                $roman = [10 => 'X', 11 => 'XI', 12 => 'XII'];

                return ($roman[$this->grade] ?? $this->grade).' '.$this->class_name;
            }
        );
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    /**
     * Check if user is siswa.
     */
    public function isSiswa(): bool
    {
        return $this->role === UserRole::Siswa;
    }

    /**
     * Check if user is eligible for library clearance (bebas perpus).
     * Only grade 12 students are eligible.
     */
    public function isEligibleForClearance(): bool
    {
        return $this->grade === 12;
    }

    /**
     * Check if user has any unpaid fines.
     */
    public function hasUnpaidFines(): bool
    {
        return $this->loans()
            ->whereHas('fine', fn ($q) => $q->whereNot('status', 'paid'))
            ->exists();
    }

    /**
     * Check if user has any active loans.
     */
    public function hasActiveLoans(): bool
    {
        return $this->activeLoans()->exists();
    }

    /**
     * Check if user can get library clearance.
     */
    public function canGetClearance(): bool
    {
        return $this->isEligibleForClearance()
            && ! $this->hasActiveLoans()
            && ! $this->hasUnpaidFines()
            && $this->membership_status === MembershipStatus::Active;
    }

    /**
     * Check if user is using default password (date of birth).
     * Returns true if password has never been changed.
     */
    public function isUsingDefaultPassword(): bool
    {
        return $this->isSiswa() && is_null($this->password_changed_at);
    }

    /**
     * Check if user must change password before continuing.
     */
    public function mustChangePassword(): bool
    {
        return $this->isUsingDefaultPassword();
    }

    /**
     * Generate default password from date of birth.
     * Format: ddmmyyyy (e.g., 15012005 for 15 January 2005)
     */
    public static function generateDefaultPassword(\DateTimeInterface|string $dateOfBirth): string
    {
        if (is_string($dateOfBirth)) {
            $dateOfBirth = Carbon::parse($dateOfBirth);
        }

        return $dateOfBirth->format('dmY');
    }

    /**
     * Set password and mark as changed.
     */
    public function changePassword(string $newPassword): void
    {
        $this->update([
            'password' => Hash::make($newPassword),
            'password_changed_at' => now(),
        ]);
    }

    /**
     * Reset password to default (date of birth).
     */
    public function resetPasswordToDefault(): void
    {
        if (! $this->date_of_birth) {
            throw new \RuntimeException('Cannot reset password: date of birth is not set.');
        }

        $this->update([
            'password' => Hash::make(self::generateDefaultPassword($this->date_of_birth)),
            'password_changed_at' => null,
        ]);
    }
}
