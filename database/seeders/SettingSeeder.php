<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'fine_per_day',
                'value' => '2000',
            ],
            [
                'key' => 'loan_duration_days',
                'value' => '3',
            ],
            [
                'key' => 'qris_image',
                'value' => 'qris/qris-payment.png',
            ],
            [
                'key' => 'library_name',
                'value' => 'MA Al-Ma\'ruf - Perpustakaan Digital',
            ],
            [
                'key' => 'library_address',
                'value' => 'Jl. Pendidikan No. 123, Kota Bandung',
            ],
            [
                'key' => 'library_phone',
                'value' => '022-1234567',
            ],
            [
                'key' => 'max_books_per_loan',
                'value' => '3',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value']]
            );
        }
    }
}
