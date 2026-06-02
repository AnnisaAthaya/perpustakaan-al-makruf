<?php

namespace Database\Seeders;

use App\Enums\MembershipStatus;
use App\Enums\UserRole;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create main Admin (easy to remember)
        User::create([
            'name' => 'Administrator',
            'nis' => null,
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
            'password_changed_at' => now(),
            'role' => UserRole::Admin,
            'phone' => '081234567890',
            'grade' => null,
            'class_name' => null,
            'date_of_birth' => null,
            'address' => 'Jl. Perpustakaan No. 1',
            'membership_status' => MembershipStatus::Active,
        ]);

        // Create main Siswa (easy to remember, password already changed)
        User::create([
            'name' => 'Siswa Demo',
            'nis' => '2024000001',
            'email' => 'siswa@siswa.com',
            'password' => Hash::make('password'),
            'password_changed_at' => now(), // Already changed password
            'role' => UserRole::Siswa,
            'phone' => '081234567891',
            'grade' => 12,
            'class_name' => 'IPA 1',
            'date_of_birth' => Carbon::create(2006, 1, 1),
            'address' => 'Jl. Siswa No. 1',
            'membership_status' => MembershipStatus::Active,
        ]);

        // Create specific students for testing with default password (date of birth)
        /* $students = [ */
        /*     [ */
        /*         'name' => 'Ahmad Rizky', */
        /*         'nis' => '2024001001', */
        /*         'email' => 'ahmad@siswa.com', */
        /*         'grade' => 12, */
        /*         'class_name' => 'IPA 1', */
        /*         'date_of_birth' => Carbon::create(2006, 5, 15), // Password: 15052006 */
        /*     ], */
        /*     [ */
        /*         'name' => 'Siti Nurhaliza', */
        /*         'nis' => '2024001002', */
        /*         'email' => 'siti@siswa.com', */
        /*         'grade' => 12, */
        /*         'class_name' => 'IPA 2', */
        /*         'date_of_birth' => Carbon::create(2006, 8, 22), // Password: 22082006 */
        /*     ], */
        /*     [ */
        /*         'name' => 'Budi Santoso', */
        /*         'nis' => '2024001003', */
        /*         'email' => 'budi@siswa.com', */
        /*         'grade' => 11, */
        /*         'class_name' => 'IPS 1', */
        /*         'date_of_birth' => Carbon::create(2007, 3, 10), // Password: 10032007 */
        /*     ], */
        /*     [ */
        /*         'name' => 'Dewi Lestari', */
        /*         'nis' => '2024001004', */
        /*         'email' => 'dewi@siswa.com', */
        /*         'grade' => 10, */
        /*         'class_name' => 'IPA 1', */
        /*         'date_of_birth' => Carbon::create(2008, 12, 1), // Password: 01122008 */
        /*     ], */
        /* ]; */
        /**/
        /* foreach ($students as $student) { */
        /*     User::create([ */
        /*         'name' => $student['name'], */
        /*         'nis' => $student['nis'], */
        /*         'email' => $student['email'], */
        /*         'password' => Hash::make(User::generateDefaultPassword($student['date_of_birth'])), */
        /*         'password_changed_at' => null, // Using default password */
        /*         'role' => UserRole::Siswa, */
        /*         'phone' => '08'.fake()->numerify('##########'), */
        /*         'grade' => $student['grade'], */
        /*         'class_name' => $student['class_name'], */
        /*         'date_of_birth' => $student['date_of_birth'], */
        /*         'address' => fake()->address(), */
        /*         'membership_status' => MembershipStatus::Active, */
        /*     ]); */
        /* } */
        /**/
        /* // Create additional random students using factory (untuk mendukung semua loan scenarios) */
        /* // Total akan ada ~65 siswa (1 admin + 1 siswa demo + 4 manual + 60 factory) */
        /* User::factory(60)->siswa()->sequence(fn ($sequence) => [ */
        /*     'email' => 'siswa'.($sequence->index + 5).'@siswa.com', // Start from siswa5@ */
        /* ])->create(); */
    }
}
