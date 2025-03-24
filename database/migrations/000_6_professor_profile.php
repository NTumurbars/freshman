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
        Schema::create('professor_profiles', function (Blueprint $table) {
            $table->id();
            // Every profile has a valid professor (user)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Every professor is associated with a department
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            // Professor's office location
            $table->string('office_location')->nullable();
            // Their phone number
            $table->string('phone_number')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('professor_profiles');
    }
};
