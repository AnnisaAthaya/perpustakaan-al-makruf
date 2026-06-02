<?php

use App\Enums\Language;
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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('title');
            $table->string('author')->nullable();
            $table->string('publisher')->nullable();
            $table->string('language', 20)->default(Language::Indonesia->value);
            $table->text('description')->nullable();
            $table->string('isbn', 20)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('available')->default(0);
            $table->string('cover')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('location', 100)->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
