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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            // Each course belongs to a department
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            // Optional a course can be associated with a major (nullable)
            $table->foreignId('major_id')->nullable()->constrained()->onDelete('set null');
            // Course code like "1051" (this will combine with department/major codes later)
            $table->string('course_code')->unique();
            // The actual title of the course
            $table->string('title');
            // The description of the course
            $table->text('description')->nullable();
            // Capacity of the class
            $table->unsignedInteger('capacity')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
