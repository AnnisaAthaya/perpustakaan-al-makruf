<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Fiksi',
            'Non-Fiksi',
            'Sains',
            'Matematika',
            'Sejarah',
            'Bahasa Indonesia',
            'Bahasa Inggris',
            'Agama',
            'Teknologi',
            'Seni & Budaya',
            'Olahraga',
            'Ensiklopedia',
            'Novel',
            'Biografi',
            'Psikologi',
        ];

        foreach ($categories as $category) {
            Category::create(['name' => $category]);
        }
    }
}
