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
        Schema::table('books', function (Blueprint $table) {
            // Drop UNIQUE constraint from code column
            $table->dropUnique(['code']);

            // Make code column nullable
            $table->string('code', 20)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            // Restore UNIQUE constraint and NOT NULL
            $table->string('code', 20)->unique()->change();
        });
    }
};
