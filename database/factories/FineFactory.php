<?php

namespace Database\Factories;

use App\Enums\FineStatus;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Fine>
 */
class FineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $lateDays = fake()->numberBetween(1, 14);
        $finePerDay = 2000;

        return [
            'loan_id' => Loan::factory()->returnedLate($lateDays),
            'amount' => $lateDays * $finePerDay,
            'late_days' => $lateDays,
            'status' => FineStatus::Unpaid,
            'payment_proof' => null,
            'submitted_at' => null,
            'verified_at' => null,
            'verified_by' => null,
            'notes' => null,
        ];
    }

    /**
     * Indicate that the fine is unpaid.
     */
    public function unpaid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => FineStatus::Unpaid,
            'payment_proof' => null,
            'submitted_at' => null,
            'verified_at' => null,
            'verified_by' => null,
        ]);
    }

    /**
     * Indicate that the fine is pending verification.
     */
    public function pendingVerification(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => FineStatus::PendingVerification,
            'payment_proof' => 'payment-proofs/'.fake()->uuid().'.jpg',
            'submitted_at' => fake()->dateTimeBetween('-3 days', 'now'),
            'verified_at' => null,
            'verified_by' => null,
        ]);
    }

    /**
     * Indicate that the fine is paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => FineStatus::Paid,
            'payment_proof' => 'payment-proofs/'.fake()->uuid().'.jpg',
            'submitted_at' => fake()->dateTimeBetween('-1 week', '-3 days'),
            'verified_at' => fake()->dateTimeBetween('-3 days', 'now'),
            'verified_by' => User::factory()->admin(),
        ]);
    }

    /**
     * Indicate that the fine belongs to a specific loan.
     */
    public function forLoan(Loan $loan): static
    {
        $lateDays = $loan->overdue_days;

        return $this->state(fn (array $attributes) => [
            'loan_id' => $loan->id,
            'late_days' => $lateDays,
            'amount' => $lateDays * 2000,
        ]);
    }
}
