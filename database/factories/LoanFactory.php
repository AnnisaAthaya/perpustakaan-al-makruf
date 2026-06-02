<?php

namespace Database\Factories;

use App\Enums\LoanStatus;
use App\Models\Book;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Loan>
 */
class LoanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $borrowedAt = fake()->dateTimeBetween('-2 weeks', 'now');
        $dueDate = Carbon::parse($borrowedAt)->addDays(3);

        return [
            'user_id' => User::factory()->siswa(),
            'book_id' => Book::factory(),
            'borrowed_at' => $borrowedAt,
            'due_date' => $dueDate,
            'returned_at' => null,
            'status' => LoanStatus::Active,
            'notes' => null,
        ];
    }

    /**
     * Indicate that the loan is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LoanStatus::Active,
            'returned_at' => null,
        ]);
    }

    /**
     * Indicate that the loan is overdue.
     */
    public function overdue(): static
    {
        $borrowedAt = fake()->dateTimeBetween('-2 weeks', '-5 days');
        $dueDate = Carbon::parse($borrowedAt)->addDays(3);

        return $this->state(fn (array $attributes) => [
            'borrowed_at' => $borrowedAt,
            'due_date' => $dueDate,
            'status' => LoanStatus::Active,
            'returned_at' => null,
        ]);
    }

    /**
     * Indicate that the loan is returned on time.
     */
    public function returnedOnTime(): static
    {
        $borrowedAt = fake()->dateTimeBetween('-2 weeks', '-4 days');
        $dueDate = Carbon::parse($borrowedAt)->addDays(3);
        $returnedAt = Carbon::parse($borrowedAt)->addDays(fake()->numberBetween(1, 3));

        return $this->state(fn (array $attributes) => [
            'borrowed_at' => $borrowedAt,
            'due_date' => $dueDate,
            'returned_at' => $returnedAt,
            'status' => LoanStatus::Returned,
        ]);
    }

    /**
     * Indicate that the loan is returned late.
     */
    public function returnedLate(?int $lateDays = null): static
    {
        $lateDays = $lateDays ?? fake()->numberBetween(1, 7);
        $borrowedAt = fake()->dateTimeBetween('-3 weeks', '-1 week');
        $dueDate = Carbon::parse($borrowedAt)->addDays(3);
        $returnedAt = Carbon::parse($dueDate)->addDays($lateDays);

        return $this->state(fn (array $attributes) => [
            'borrowed_at' => $borrowedAt,
            'due_date' => $dueDate,
            'returned_at' => $returnedAt,
            'status' => LoanStatus::Returned,
        ]);
    }

    /**
     * Indicate that the loan belongs to a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Indicate that the loan is for a specific book.
     */
    public function forBook(Book $book): static
    {
        return $this->state(fn (array $attributes) => [
            'book_id' => $book->id,
        ]);
    }
}
