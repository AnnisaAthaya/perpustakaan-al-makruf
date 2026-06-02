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
        Schema::create('library_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('visited_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('visited_at');
            $table->index('created_at');

            // Constraint: 1 kunjungan per user per hari
            $table->unique(['user_id', 'visited_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_visits');
    }
};
