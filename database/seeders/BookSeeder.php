<?php

namespace Database\Seeders;

use App\Enums\Language;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();

        if ($categories->isEmpty()) {
            return;
        }

        $books = [
            [
                'code' => 'B001',
                'title' => 'Laskar Pelangi',
                'author' => 'Andrea Hirata',
                'publisher' => 'Bentang Pustaka',
                'language' => Language::Indonesia,
                'description' => 'Novel tentang perjuangan anak-anak Belitung',
                'isbn' => '9789793062792',
                'stock' => 8,
                'available' => 8,
                'location' => 'Rak A1',
                'year' => 2005,
                'category' => 'Novel',
            ],
            [
                'code' => 'B002',
                'title' => 'Bumi Manusia',
                'author' => 'Pramoedya Ananta Toer',
                'publisher' => 'Hasta Mitra',
                'language' => Language::Indonesia,
                'description' => 'Novel sejarah Indonesia',
                'isbn' => '9789799731234',
                'stock' => 6,
                'available' => 6,
                'location' => 'Rak A1',
                'year' => 1980,
                'category' => 'Novel',
            ],
            [
                'code' => 'B003',
                'title' => 'Fisika Dasar Jilid 1',
                'author' => 'Halliday & Resnick',
                'publisher' => 'Erlangga',
                'language' => Language::Indonesia,
                'description' => 'Buku pegangan fisika dasar',
                'isbn' => '9786022986789',
                'stock' => 12,
                'available' => 12,
                'location' => 'Rak B1',
                'year' => 2018,
                'category' => 'Sains',
            ],
            [
                'code' => 'B004',
                'title' => 'Kalkulus Jilid 1',
                'author' => 'Purcell',
                'publisher' => 'Erlangga',
                'language' => Language::Indonesia,
                'description' => 'Buku pegangan kalkulus',
                'isbn' => '9786022986790',
                'stock' => 10,
                'available' => 10,
                'location' => 'Rak B2',
                'year' => 2019,
                'category' => 'Matematika',
            ],
            [
                'code' => 'B005',
                'title' => 'Sejarah Indonesia Modern',
                'author' => 'M.C. Ricklefs',
                'publisher' => 'Gadjah Mada University Press',
                'language' => Language::Indonesia,
                'description' => 'Sejarah Indonesia dari abad ke-16',
                'isbn' => '9789794203156',
                'stock' => 7,
                'available' => 7,
                'location' => 'Rak C1',
                'year' => 2008,
                'category' => 'Sejarah',
            ],
            [
                'code' => 'B006',
                'title' => 'Harry Potter and the Philosopher\'s Stone',
                'author' => 'J.K. Rowling',
                'publisher' => 'Bloomsbury',
                'language' => Language::English,
                'description' => 'Fantasy novel',
                'isbn' => '9780747532699',
                'stock' => 9,
                'available' => 9,
                'location' => 'Rak A2',
                'year' => 1997,
                'category' => 'Fiksi',
            ],
            [
                'code' => 'B007',
                'title' => 'Al-Quran dan Terjemahannya',
                'author' => 'Kemenag RI',
                'publisher' => 'Kemenag',
                'language' => Language::Arabic,
                'description' => 'Al-Quran dengan terjemahan Bahasa Indonesia',
                'isbn' => '9789790990123',
                'stock' => 20,
                'available' => 20,
                'location' => 'Rak D1',
                'year' => 2020,
                'category' => 'Agama',
            ],
            [
                'code' => 'B008',
                'title' => 'Pemrograman Python untuk Pemula',
                'author' => 'Abdul Kadir',
                'publisher' => 'Andi Publisher',
                'language' => Language::Indonesia,
                'description' => 'Panduan belajar Python',
                'isbn' => '9789792983456',
                'stock' => 8,
                'available' => 8,
                'location' => 'Rak E1',
                'year' => 2021,
                'category' => 'Teknologi',
            ],
            [
                'code' => 'B009',
                'title' => 'Psikologi Pendidikan',
                'author' => 'John W. Santrock',
                'publisher' => 'Salemba Humanika',
                'language' => Language::Indonesia,
                'description' => 'Teori psikologi dalam pendidikan',
                'isbn' => '9789790612789',
                'stock' => 6,
                'available' => 6,
                'location' => 'Rak F1',
                'year' => 2017,
                'category' => 'Psikologi',
            ],
            [
                'code' => 'B010',
                'title' => 'Tata Bahasa Baku Bahasa Indonesia',
                'author' => 'Badan Bahasa',
                'publisher' => 'Kemendikbud',
                'language' => Language::Indonesia,
                'description' => 'Panduan tata bahasa Indonesia',
                'isbn' => '9789790123456',
                'stock' => 10,
                'available' => 10,
                'location' => 'Rak G1',
                'year' => 2022,
                'category' => 'Bahasa Indonesia',
            ],
        ];

        foreach ($books as $bookData) {
            $categoryName = $bookData['category'];
            unset($bookData['category']);

            $category = $categories->firstWhere('name', $categoryName);
            $bookData['category_id'] = $category?->id;

            Book::create($bookData);
        }

        // Create additional random books for variety (total akan jadi ~60 buku)
        Book::factory(50)->create([
            'category_id' => fn () => $categories->random()->id,
        ]);
    }
}
