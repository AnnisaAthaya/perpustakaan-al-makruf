<?php

namespace Database\Factories;

use App\Enums\Language;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $stock = fake()->numberBetween(1, 10);

        return [
            'code' => 'B'.fake()->unique()->numerify('###'),
            'title' => fake()->sentence(3),
            'author' => fake()->name(),
            'publisher' => fake()->randomElement(['Erlangga', 'Gramedia', 'Yudhistira', 'Tiga Serangkai', 'Intan Pariwara']),
            'language' => fake()->randomElement(Language::cases()),
            'description' => fake()->optional(0.7)->sentence(),
            'isbn' => fake()->optional(0.8)->isbn13(),
            'stock' => $stock,
            'available' => fake()->numberBetween(0, $stock),
            'cover' => null,
            'category_id' => null,
            'location' => fake()->optional(0.8)->randomElement(['Rak A1', 'Rak A2', 'Rak B1', 'Rak B2', 'Rak C1', 'Rak C2']),
            'year' => fake()->optional(0.9)->numberBetween(2000, 2024),
        ];
    }

    /**
     * Indicate that the book belongs to a category.
     */
    public function withCategory(?Category $category = null): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category?->id ?? Category::factory(),
        ]);
    }

    /**
     * Indicate that the book is fully available.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'available' => $attributes['stock'],
        ]);
    }

    /**
     * Indicate that the book is out of stock.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'available' => 0,
        ]);
    }

    /**
     * Indicate that the book has a cover image.
     */
    public function withCover(): static
    {
        return $this->state(fn (array $attributes) => [
            'cover' => 'covers/'.fake()->uuid().'.jpg',
        ]);
    }
}
