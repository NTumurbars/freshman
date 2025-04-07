<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // The column is already named 'number', we just need to make sure it's an integer
        Schema::table('floors', function (Blueprint $table) {
            DB::statement('ALTER TABLE floors MODIFY number INTEGER NOT NULL');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // If needed to roll back, convert back to string
        Schema::table('floors', function (Blueprint $table) {
            DB::statement('ALTER TABLE floors MODIFY number VARCHAR(255) NOT NULL');
        });
    }
};
