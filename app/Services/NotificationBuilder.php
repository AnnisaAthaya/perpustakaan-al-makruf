<?php

namespace App\Services;

use App\Models\Fine;
use App\Models\Loan;
use App\Notifications\GenericNotification;

class NotificationBuilder
{
    /**
     * Notification: Siswa successfully requested a loan.
     */
    public static function loanRequested(Loan $loan): GenericNotification
    {
        return new GenericNotification(
            notificationType: 'loan_requested',
            title: 'Pengajuan Pinjaman Berhasil',
            message: "Pengajuan pinjaman buku '{$loan->book->title}' berhasil dikirim. Menunggu persetujuan admin.",
            actionUrl: route('loans.index'),
            actionLabel: 'Lihat Daftar Pinjaman',
            metadata: [
                'loan_id' => $loan->id,
                'book_title' => $loan->book->title,
                'book_id' => $loan->book_id,
            ]
        );
    }

    /**
     * Notification: Admin receives new loan request.
     */
    public static function newLoanRequest(Loan $loan): GenericNotification
    {
        return new GenericNotification(
            notificationType: 'new_loan_request',
            title: 'Pengajuan Pinjaman Baru',
            message: "{$loan->user->name} mengajukan pinjaman buku '{$loan->book->title}'.",
            actionUrl: route('admin.loans.show', $loan),
            actionLabel: 'Review Pengajuan',
            metadata: [
                'loan_id' => $loan->id,
                'user_id' => $loan->user_id,
                'user_name' => $loan->user->name,
                'book_title' => $loan->book->title,
                'book_id' => $loan->book_id,
            ]
        );
    }

    /**
     * Notification: Admin approved the loan request.
     */
    public static function loanApproved(Loan $loan): GenericNotification
    {
        return new GenericNotification(
            notificationType: 'loan_approved',
            title: 'Pinjaman Disetujui!',
            message: "Pengajuan pinjaman buku '{$loan->book->title}' telah disetujui. Jangan lupa untuk mengembalikan tepat waktu.",
            actionUrl: route('loans.index'),
            actionLabel: 'Lihat Detail Pinjaman',
            metadata: [
                'loan_id' => $loan->id,
                'book_title' => $loan->book->title,
                'due_date' => $loan->due_date?->format('d M Y'),
            ]
        );
    }

    /**
     * Notification: Admin rejected the loan request.
     */
    public static function loanRejected(Loan $loan, ?string $reason = null): GenericNotification
    {
        $message = "Pengajuan pinjaman buku '{$loan->book->title}' ditolak.";
        if ($reason) {
            $message .= " Alasan: {$reason}";
        }

        return new GenericNotification(
            notificationType: 'loan_rejected',
            title: 'Pinjaman Ditolak',
            message: $message,
            actionUrl: route('loans.index'),
            actionLabel: 'Lihat Daftar Pinjaman',
            metadata: [
                'loan_id' => $loan->id,
                'book_title' => $loan->book->title,
                'reason' => $reason,
            ]
        );
    }

    /**
     * Notification: Siswa cancelled their loan request.
     */
    public static function loanCancelled(Loan $loan): GenericNotification
    {
        return new GenericNotification(
            notificationType: 'loan_cancelled',
            title: 'Pinjaman Dibatalkan',
            message: "Pengajuan pinjaman buku '{$loan->book->title}' berhasil dibatalkan.",
            actionUrl: route('loans.index'),
            actionLabel: 'Lihat Daftar Pinjaman',
            metadata: [
                'loan_id' => $loan->id,
                'book_title' => $loan->book->title,
            ]
        );
    }

    /**
     * Notification: Book has been returned successfully.
     */
    public static function bookReturned(Loan $loan): GenericNotification
    {
        return new GenericNotification(
            notificationType: 'book_returned',
            title: 'Buku Berhasil Dikembalikan',
            message: "Buku '{$loan->book->title}' telah berhasil dikembalikan. Terima kasih!",
            actionUrl: route('loans.index'),
            actionLabel: 'Lihat Detail Pinjaman',
            metadata: [
                'loan_id' => $loan->id,
                'book_title' => $loan->book->title,
                'returned_at' => $loan->returned_at?->format('d M Y H:i'),
            ]
        );
    }

    /**
     * Notification: Fine created due to late return.
     */
    public static function fineCreated(Fine $fine): GenericNotification
    {
        $amount = number_format($fine->amount, 0, ',', '.');

        return new GenericNotification(
            notificationType: 'fine_created',
            title: 'Denda Keterlambatan',
            message: "Terdapat denda keterlambatan sebesar Rp {$amount} untuk buku '{$fine->loan->book->title}'. Silakan lakukan pembayaran.",
            actionUrl: route('fines.index'),
            actionLabel: 'Bayar Denda',
            metadata: [
                'fine_id' => $fine->id,
                'loan_id' => $fine->loan_id,
                'amount' => $fine->amount,
                'late_days' => $fine->late_days,
                'book_title' => $fine->loan->book->title,
            ]
        );
    }

    /**
     * Notification: Siswa uploaded payment proof.
     */
    public static function fineProofUploaded(Fine $fine): GenericNotification
    {
        return new GenericNotification(
            notificationType: 'fine_proof_uploaded',
            title: 'Bukti Pembayaran Dikirim',
            message: "Bukti pembayaran denda untuk buku '{$fine->loan->book->title}' berhasil dikirim. Menunggu verifikasi admin.",
            actionUrl: route('fines.index'),
            actionLabel: 'Lihat Detail Denda',
            metadata: [
                'fine_id' => $fine->id,
                'loan_id' => $fine->loan_id,
                'amount' => $fine->amount,
                'book_title' => $fine->loan->book->title,
            ]
        );
    }

    /**
     * Notification: Admin receives new payment proof submission.
     */
    public static function fineProofSubmitted(Fine $fine): GenericNotification
    {
        $amount = number_format($fine->amount, 0, ',', '.');

        return new GenericNotification(
            notificationType: 'fine_proof_submitted',
            title: 'Bukti Pembayaran Baru',
            message: "{$fine->loan->user->name} mengirim bukti pembayaran denda sebesar Rp {$amount} untuk buku '{$fine->loan->book->title}'.",
            actionUrl: route('admin.fines.show', $fine),
            actionLabel: 'Verifikasi Pembayaran',
            metadata: [
                'fine_id' => $fine->id,
                'loan_id' => $fine->loan_id,
                'user_id' => $fine->loan->user_id,
                'user_name' => $fine->loan->user->name,
                'amount' => $fine->amount,
                'book_title' => $fine->loan->book->title,
            ]
        );
    }

    /**
     * Notification: Admin verified the payment.
     */
    public static function fineVerified(Fine $fine): GenericNotification
    {
        return new GenericNotification(
            notificationType: 'fine_verified',
            title: 'Pembayaran Diterima',
            message: "Pembayaran denda untuk buku '{$fine->loan->book->title}' telah diverifikasi. Terima kasih!",
            actionUrl: route('fines.index'),
            actionLabel: 'Lihat Detail Denda',
            metadata: [
                'fine_id' => $fine->id,
                'loan_id' => $fine->loan_id,
                'amount' => $fine->amount,
                'book_title' => $fine->loan->book->title,
            ]
        );
    }

    /**
     * Notification: Admin rejected the payment proof.
     */
    public static function fineRejected(Fine $fine, ?string $reason = null): GenericNotification
    {
        $message = "Bukti pembayaran denda untuk buku '{$fine->loan->book->title}' ditolak.";
        if ($reason) {
            $message .= " Alasan: {$reason}";
        }
        $message .= ' Silakan upload ulang bukti pembayaran yang valid.';

        return new GenericNotification(
            notificationType: 'fine_rejected',
            title: 'Pembayaran Ditolak',
            message: $message,
            actionUrl: route('fines.index'),
            actionLabel: 'Upload Ulang Bukti',
            metadata: [
                'fine_id' => $fine->id,
                'loan_id' => $fine->loan_id,
                'amount' => $fine->amount,
                'book_title' => $fine->loan->book->title,
                'reason' => $reason,
            ]
        );
    }
}
