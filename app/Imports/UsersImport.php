<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithUpserts;

class UsersImport implements SkipsOnError, ToModel, WithBatchInserts, WithChunkReading, WithUpserts
{
    use Importable, RemembersRowNumber, SkipsErrors;

    /**
     * Convert CSV row to User model
     */
    public function model(array $row): ?User
    {
        // Skip if NIS or Name is empty
        if (empty($row[0]) || empty($row[1])) {
            return null;
        }

        // Detect role from CSV column 3
        $csvRole = $row[3] ?? '';
        $role = $this->determineRole($csvRole);

        // Generate email from name + NIS
        $email = $this->generateEmail($row[1], $row[0], $role);

        // Generate password from date of birth or use default
        $password = $this->generatePassword($row[16] ?? '');

        // Use faster hashing for bulk import (rounds=4)
        // This is still secure, just optimized for performance
        $hashedPassword = Hash::driver('bcrypt')->make($password, ['rounds' => 4]);

        // Parse date of birth - handle invalid dates (0000-00-00)
        $dateOfBirth = $this->parseDateOfBirth($row[16] ?? '');

        return new User([
            'nis' => $row[0],
            'name' => $row[1],
            'email' => $email,
            'password' => $hashedPassword,
            'role' => $role,
            'phone' => null,
            'grade' => null,
            'class_name' => null,
            'date_of_birth' => $dateOfBirth,
            'address' => $row[5] ?: null,
            'avatar' => null,
            'membership_status' => 'active',
            'password_changed_at' => null,
        ]);
    }

    /**
     * Determine role from CSV role column
     * - If contains "guru" or "staff" → admin
     * - Otherwise → siswa
     */
    private function determineRole(string $csvRole): string
    {
        $csvRoleLower = strtolower($csvRole);

        if (str_contains($csvRoleLower, 'guru') || str_contains($csvRoleLower, 'staff')) {
            return 'admin';
        }

        return 'siswa';
    }

    /**
     * Upsert based on email (update if exists, insert if not)
     */
    public function uniqueBy()
    {
        return 'email';
    }

    /**
     * Chunk size for memory optimization
     */
    public function chunkSize(): int
    {
        return 100;
    }

    /**
     * Batch size for database inserts
     */
    public function batchSize(): int
    {
        return 100;
    }

    /**
     * Generate email based on role
     * - Siswa: {firstname}.{nis}@student.almaruf.sch.id
     * - Admin: {firstname}.{nis}@staff.almaruf.sch.id
     *
     * Examples:
     * - "REVA CITRA PERTIWI" + "233047" + "siswa" → "reva.233047@student.almaruf.sch.id"
     * - "M. GHUFRON,S.Pd.I" + "00001" + "admin" → "m.00001@staff.almaruf.sch.id"
     */
    private function generateEmail(string $fullName, string $nis, string $role): string
    {
        $nameParts = explode(' ', $fullName);
        $firstName = strtolower($nameParts[0]);

        // Remove dots and commas for cleaner email
        $firstName = str_replace(['.', ','], '', $firstName);

        $domain = $role === 'admin' ? 'staff.almaruf.sch.id' : 'student.almaruf.sch.id';

        return "{$firstName}.{$nis}@{$domain}";
    }

    /**
     * Generate password from date of birth (ddmmyyyy format)
     * If invalid date (0000-00-00 or empty), use default password
     *
     * Examples:
     * - "2008-08-13" → "13082008"
     * - "0000-00-00" → "almaruf2024"
     * - "" → "almaruf2024"
     */
    private function generatePassword(string $dateOfBirth): string
    {
        // Handle invalid or empty dates
        if (empty($dateOfBirth) || $dateOfBirth === '0000-00-00') {
            return 'almaruf2024';
        }

        $timestamp = strtotime($dateOfBirth);

        // If strtotime failed, use default password
        if ($timestamp === false) {
            return 'almaruf2024';
        }

        return date('dmY', $timestamp);
    }

    /**
     * Parse date of birth - return null for invalid dates
     *
     * Examples:
     * - "2008-08-13" → "2008-08-13"
     * - "0000-00-00" → null
     * - "" → null
     */
    private function parseDateOfBirth(string $dateOfBirth): ?string
    {
        if (empty($dateOfBirth) || $dateOfBirth === '0000-00-00') {
            return null;
        }

        $timestamp = strtotime($dateOfBirth);

        if ($timestamp === false) {
            return null;
        }

        return $dateOfBirth;
    }
}
