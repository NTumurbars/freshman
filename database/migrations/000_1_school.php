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
         Schema::create('schools', function (Blueprint $table) {
            $table->id();
            // Name of the university
            $table->string('name')->unique();
            // This is the personal mail of the creator (who will be our first admin). We will use this field for sending the generated credentials
            $table->string('email');
            // Timestamps to track the created and updated times
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
