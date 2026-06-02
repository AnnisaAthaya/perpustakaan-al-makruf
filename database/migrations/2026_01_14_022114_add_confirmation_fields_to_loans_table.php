<?php

use App\Enums\LoanStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            // Make borrowed_at and due_date nullable (set when admin confirms)
            $table->dateTime('borrowed_at')->nullable()->change();
            $table->dateTime('due_date')->nullable()->change();

            // Change default status to pending
            $table->string('status', 20)->default(LoanStatus::Pending->value)->change();

            // Confirmation fields
            $table->dateTime('confirmed_at')->nullable()->after('status');
            $table->foreignId('confirmed_by')->nullable()->after('confirmed_at')->constrained('users')->nullOnDelete();

            // Rejection/Cancellation reason
            $table->text('rejection_reason')->nullable()->after('confirmed_by');
            $table->text('cancellation_reason')->nullable()->after('rejection_reason');

            // Request timestamp (when siswa requested)
            $table->dateTime('requested_at')->nullable()->after('book_id');
        });

        // Update existing loans to have requested_at = borrowed_at
        DB::table('loans')->whereNull('requested_at')->update([
            'requested_at' => DB::raw('borrowed_at'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropForeign(['confirmed_by']);
            $table->dropColumn([
                'requested_at',
                'confirmed_at',
                'confirmed_by',
                'rejection_reason',
                'cancellation_reason',
            ]);

            // Revert nullable and default changes
            $table->dateTime('borrowed_at')->nullable(false)->change();
            $table->dateTime('due_date')->nullable(false)->change();
            $table->string('status', 20)->default(LoanStatus::Active->value)->change();
        });
    }
};
