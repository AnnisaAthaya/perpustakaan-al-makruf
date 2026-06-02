<?php

namespace Database\Seeders;

use App\Enums\FineStatus;
use App\Enums\LoanStatus;
use App\Enums\UserRole;
use App\Models\Book;
use App\Models\Fine;
use App\Models\Loan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LoanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = User::where('role', UserRole::Siswa)->get();
        $books = Book::all();
        $admin = User::where('role', UserRole::Admin)->first();

        if ($students->isEmpty() || $books->isEmpty()) {
            return;
        }

        // ===============================================================
        // SCENARIO 1: PENDING LOANS (Menunggu Persetujuan Admin)
        // Admin dapat: Approve atau Reject
        // ===============================================================
        foreach ($students->take(8) as $student) {
            $book = $books->random();
            $requestedAt = Carbon::now()->subHours(rand(1, 48));

            Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $requestedAt,
                'borrowed_at' => null,
                'due_date' => null,
                'status' => LoanStatus::Pending,
            ]);
        }

        // ===============================================================
        // SCENARIO 2: REJECTED LOANS (Ditolak Admin)
        // Data historis untuk referensi
        // ===============================================================
        foreach ($students->skip(8)->take(4) as $student) {
            $book = $books->random();
            $requestedAt = Carbon::now()->subDays(rand(3, 7));

            Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $requestedAt,
                'borrowed_at' => null,
                'due_date' => null,
                'status' => LoanStatus::Rejected,
                'rejection_reason' => collect([
                    'Buku sedang dalam perbaikan',
                    'Siswa memiliki denda yang belum dibayar',
                    'Kuota peminjaman sudah penuh',
                    'Buku tidak tersedia untuk dipinjam',
                ])->random(),
            ]);
        }

        // ===============================================================
        // SCENARIO 3: ACTIVE LOANS - ON TIME (Dipinjam, Belum Jatuh Tempo)
        // Admin dapat: Proses Pengembalian
        // ===============================================================
        foreach ($students->skip(12)->take(6) as $student) {
            $book = $books->where('available', '>', 0)->random();
            $borrowedAt = Carbon::now()->subHours(rand(1, 48));

            Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $borrowedAt->copy()->subHours(rand(1, 3)),
                'borrowed_at' => $borrowedAt,
                'due_date' => $borrowedAt->copy()->addDays(3),
                'status' => LoanStatus::Active,
            ]);

            $book->decreaseAvailable();
        }

        // ===============================================================
        // SCENARIO 4: OVERDUE LOANS - BELUM DIKEMBALIKAN (Terlambat)
        // Admin dapat: Proses Pengembalian (akan otomatis buat denda)
        // ===============================================================
        foreach ($students->skip(18)->take(6) as $student) {
            $book = $books->where('available', '>', 0)->random();
            $borrowedAt = Carbon::now()->subDays(rand(5, 10));

            Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $borrowedAt->copy()->subHours(2),
                'borrowed_at' => $borrowedAt,
                'due_date' => $borrowedAt->copy()->addDays(3),
                'status' => LoanStatus::Active,
            ]);

            $book->decreaseAvailable();
        }

        // ===============================================================
        // SCENARIO 5: RETURNED ON TIME - NO FINE (Dikembalikan Tepat Waktu)
        // Data historis
        // ===============================================================
        foreach ($students->skip(24)->take(8) as $student) {
            $book = $books->random();
            $borrowedAt = Carbon::now()->subDays(rand(10, 30));
            $returnedAt = $borrowedAt->copy()->addHours(rand(12, 72)); // 12 jam - 3 hari

            Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $borrowedAt->copy()->subHours(2),
                'borrowed_at' => $borrowedAt,
                'due_date' => $borrowedAt->copy()->addDays(3),
                'returned_at' => $returnedAt,
                'status' => LoanStatus::Returned,
            ]);
        }

        // ===============================================================
        // SCENARIO 6: RETURNED LATE - FINE UNPAID (Terlambat, Denda Belum Dibayar)
        // Siswa dapat: Upload Bukti Bayar
        // Admin dapat: Remind siswa untuk bayar
        // ===============================================================
        foreach ($students->skip(32)->take(5) as $student) {
            $book = $books->random();
            $borrowedAt = Carbon::now()->subDays(rand(15, 30));
            $lateDays = rand(2, 7);
            $returnedAt = $borrowedAt->copy()->addDays(3 + $lateDays);

            $loan = Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $borrowedAt->copy()->subHours(2),
                'borrowed_at' => $borrowedAt,
                'due_date' => $borrowedAt->copy()->addDays(3),
                'returned_at' => $returnedAt,
                'status' => LoanStatus::Returned,
            ]);

            Fine::create([
                'loan_id' => $loan->id,
                'amount' => $lateDays * 2000,
                'late_days' => $lateDays,
                'status' => FineStatus::Unpaid,
                'payment_proof' => null,
                'submitted_at' => null,
                'verified_at' => null,
                'verified_by' => null,
            ]);
        }

        // ===============================================================
        // SCENARIO 7: RETURNED LATE - FINE PENDING VERIFICATION (Denda Menunggu Verifikasi)
        // Admin dapat: Approve atau Reject bukti bayar
        // ===============================================================
        foreach ($students->skip(37)->take(5) as $student) {
            $book = $books->random();
            $borrowedAt = Carbon::now()->subDays(rand(10, 20));
            $lateDays = rand(1, 5);
            $returnedAt = $borrowedAt->copy()->addDays(3 + $lateDays);
            $submittedAt = Carbon::now()->subHours(rand(1, 72));

            $loan = Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $borrowedAt->copy()->subHours(2),
                'borrowed_at' => $borrowedAt,
                'due_date' => $borrowedAt->copy()->addDays(3),
                'returned_at' => $returnedAt,
                'status' => LoanStatus::Returned,
            ]);

            Fine::create([
                'loan_id' => $loan->id,
                'amount' => $lateDays * 2000,
                'late_days' => $lateDays,
                'status' => FineStatus::PendingVerification,
                'payment_proof' => 'proofs/sample-'.$student->id.'.jpg',
                'submitted_at' => $submittedAt,
                'verified_at' => null,
                'verified_by' => null,
            ]);
        }

        // ===============================================================
        // SCENARIO 8: RETURNED LATE - FINE PAID (Denda Sudah Dibayar & Diverifikasi)
        // Data historis yang sudah selesai
        // ===============================================================
        foreach ($students->skip(42)->take(6) as $student) {
            $book = $books->random();
            $borrowedAt = Carbon::now()->subDays(rand(20, 40));
            $lateDays = rand(1, 8);
            $returnedAt = $borrowedAt->copy()->addDays(3 + $lateDays);
            $submittedAt = $returnedAt->copy()->addHours(rand(1, 48));
            $verifiedAt = $submittedAt->copy()->addHours(rand(1, 24));

            $loan = Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $borrowedAt->copy()->subHours(2),
                'borrowed_at' => $borrowedAt,
                'due_date' => $borrowedAt->copy()->addDays(3),
                'returned_at' => $returnedAt,
                'status' => LoanStatus::Returned,
            ]);

            Fine::create([
                'loan_id' => $loan->id,
                'amount' => $lateDays * 2000,
                'late_days' => $lateDays,
                'status' => FineStatus::Paid,
                'payment_proof' => 'proofs/sample-verified-'.$student->id.'.jpg',
                'submitted_at' => $submittedAt,
                'verified_at' => $verifiedAt,
                'verified_by' => $admin?->id,
            ]);
        }

        // ===============================================================
        // SCENARIO 9: CANCELLED BY STUDENT (Dibatalkan Siswa)
        // Data historis
        // ===============================================================
        foreach ($students->skip(48)->take(3) as $student) {
            $book = $books->random();
            $requestedAt = Carbon::now()->subDays(rand(5, 15));

            Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $requestedAt,
                'borrowed_at' => null,
                'due_date' => null,
                'status' => LoanStatus::Cancelled,
            ]);
        }

        // ===============================================================
        // SCENARIO 10: MIXED SCENARIOS - EDGE CASES
        // ===============================================================

        // Edge Case 1: Dipinjam hari ini, jatuh tempo 3 hari lagi (fresh loan)
        $student = $students->skip(51)->first();
        if ($student) {
            $book = $books->where('available', '>', 0)->random();
            $borrowedAt = Carbon::now()->subHours(2);

            Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $borrowedAt->copy()->subMinutes(30),
                'borrowed_at' => $borrowedAt,
                'due_date' => $borrowedAt->copy()->addDays(3),
                'status' => LoanStatus::Active,
            ]);

            $book->decreaseAvailable();
        }

        // Edge Case 2: Overdue 10+ hari, denda besar, belum dibayar
        $student = $students->skip(52)->first();
        if ($student) {
            $book = $books->random();
            $borrowedAt = Carbon::now()->subDays(25);
            $lateDays = 12;
            $returnedAt = $borrowedAt->copy()->addDays(3 + $lateDays);

            $loan = Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $borrowedAt->copy()->subHours(2),
                'borrowed_at' => $borrowedAt,
                'due_date' => $borrowedAt->copy()->addDays(3),
                'returned_at' => $returnedAt,
                'status' => LoanStatus::Returned,
            ]);

            Fine::create([
                'loan_id' => $loan->id,
                'amount' => $lateDays * 2000, // Rp 24.000
                'late_days' => $lateDays,
                'status' => FineStatus::Unpaid,
                'payment_proof' => null,
                'submitted_at' => null,
                'verified_at' => null,
                'verified_by' => null,
            ]);
        }

        // Edge Case 3: Jatuh tempo hari ini (due today)
        $student = $students->skip(53)->first();
        if ($student) {
            $book = $books->where('available', '>', 0)->random();
            $borrowedAt = Carbon::now()->subDays(3);

            Loan::create([
                'user_id' => $student->id,
                'book_id' => $book->id,
                'requested_at' => $borrowedAt->copy()->subHours(2),
                'borrowed_at' => $borrowedAt,
                'due_date' => Carbon::now(),
                'status' => LoanStatus::Active,
            ]);

            $book->decreaseAvailable();
        }
    }
}
