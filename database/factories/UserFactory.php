<?php

namespace Database\Factories;

use App\Enums\MembershipStatus;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dateOfBirth = fake()->dateTimeBetween('-18 years', '-15 years');

        return [
            'name' => fake()->name(),
            'nis' => fake()->unique()->numerify('##########'),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make(User::generateDefaultPassword($dateOfBirth)),
            'password_changed_at' => null, // Default password, not changed yet
            'role' => UserRole::Siswa,
            'phone' => fake()->phoneNumber(),
            'grade' => fake()->randomElement([10, 11, 12]),
            'class_name' => fake()->randomElement(['IPA 1', 'IPA 2', 'IPS 1', 'IPS 2']),
            'date_of_birth' => $dateOfBirth,
            'address' => fake()->address(),
            'avatar' => null,
            'membership_status' => MembershipStatus::Active,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is an admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'nis' => null,
            'role' => UserRole::Admin,
            'grade' => null,
            'class_name' => null,
            'date_of_birth' => null,
            'password' => Hash::make('password'),
            'password_changed_at' => now(), // Admin always has changed password
        ]);
    }

    /**
     * Indicate that the user is a siswa.
     */
    public function siswa(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Siswa,
        ]);
    }

    /**
     * Indicate that the user has already changed their password.
     */
    public function withChangedPassword(): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => Hash::make('password'),
            'password_changed_at' => now(),
        ]);
    }

    /**
     * Indicate that the user is in grade 10.
     */
    public function grade10(): static
    {
        return $this->state(fn (array $attributes) => [
            'grade' => 10,
        ]);
    }

    /**
     * Indicate that the user is in grade 11.
     */
    public function grade11(): static
    {
        return $this->state(fn (array $attributes) => [
            'grade' => 11,
        ]);
    }

    /**
     * Indicate that the user is in grade 12.
     */
    public function grade12(): static
    {
        return $this->state(fn (array $attributes) => [
            'grade' => 12,
        ]);
    }

    /**
     * Indicate that the user has inactive membership.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'membership_status' => MembershipStatus::Inactive,
        ]);
    }

    /**
     * Indicate that the user is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'membership_status' => MembershipStatus::Suspended,
        ]);
    }
}
