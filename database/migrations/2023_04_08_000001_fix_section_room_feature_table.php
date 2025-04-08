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
        // Create the correct table if it doesn't exist
        if (!Schema::hasTable('section_room_feature')) {
            Schema::create('section_room_feature', function (Blueprint $table) {
                $table->id();
                $table->foreignId('section_id')->constrained()->onDelete('cascade');
                $table->foreignId('room_feature_id')->constrained()->onDelete('cascade');
                $table->timestamps();
            });
        }

        // If we're migrating from incorrect name, let's move the data
        if (Schema::hasTable('section_room_features')) {
            // Copy data from the old table to the new one
            DB::statement('INSERT INTO section_room_feature (id, section_id, room_feature_id, created_at, updated_at) 
                          SELECT id, section_id, room_feature_id, created_at, updated_at FROM section_room_features');
            
            // Drop the old table
            Schema::dropIfExists('section_room_features');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('section_room_feature');
    }
}; 