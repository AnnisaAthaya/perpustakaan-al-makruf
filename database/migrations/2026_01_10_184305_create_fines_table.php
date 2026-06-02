<?php

use App\Enums\FineStatus;
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
        Schema::create('fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->unsignedInteger('late_days');
            $table->string('status', 30)->default(FineStatus::Unpaid->value);
            $table->string('payment_proof')->nullable();
            $table->dateTime('submitted_at')->nullable();
            $table->dateTime('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fines');
    }
};
