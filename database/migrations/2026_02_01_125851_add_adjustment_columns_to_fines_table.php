<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('fines', function (Blueprint $table) {
            $table->decimal('original_amount', 10, 2)->nullable()->after('amount');
            $table->decimal('adjusted_amount', 10, 2)->nullable()->after('original_amount');
            $table->text('adjustment_reason')->nullable()->after('adjusted_amount');
            $table->foreignId('adjusted_by')->nullable()->constrained('users')->after('adjustment_reason');
            $table->timestamp('adjusted_at')->nullable()->after('adjusted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fines', function (Blueprint $table) {
            $table->dropForeign(['adjusted_by']);
            $table->dropColumn([
                'original_amount',
                'adjusted_amount',
                'adjustment_reason',
                'adjusted_by',
                'adjusted_at',
            ]);
        });
    }
};
