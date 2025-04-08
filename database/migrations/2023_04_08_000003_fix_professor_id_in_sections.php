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
        Schema::table('sections', function (Blueprint $table) {
            // Drop foreign key constraint first 
            $table->dropForeign(['professor_profile_id']);
            
            // Rename column
            $table->renameColumn('professor_profile_id', 'professor_id');
            
            // Add new foreign key constraint
            $table->foreign('professor_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['professor_id']);
            
            // Rename column back
            $table->renameColumn('professor_id', 'professor_profile_id');
            
            // Add original foreign key constraint
            $table->foreign('professor_profile_id')
                  ->references('id')
                  ->on('professor_profiles')
                  ->onDelete('set null');
        });
    }
}; 