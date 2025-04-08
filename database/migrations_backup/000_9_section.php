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
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            // Each section belongs to a course
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            // To track when it's happening
            $table->foreignId('term_id')->constrained()->onDelete('cascade');
            // Sections have professors (nullable if not yet assigned)
            $table->foreignId('professor_id')->nullable()->constrained('users')->onDelete('set null');
            // Section code like "801" or "802" after the course code (e.g., CIS 1051: 801)
            $table->string('section_code'); 
            $table->unsignedInteger('number_of_students')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
