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
        Schema::create('terms', function (Blueprint $table) {
            $table->id();
            // Each school has different term plans
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            // Name of the term like "Spring 2025", "Summer 2025"
            $table->string('name');
            // When does it start
            $table->date('start_date');
            // End date of the term
            $table->date('end_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('terms');
    }
};
