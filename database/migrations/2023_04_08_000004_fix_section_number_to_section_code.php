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
        Schema::table('sections', function (Blueprint $table) {
            if (Schema::hasColumn('sections', 'section_number')) {
                $table->renameColumn('section_number', 'section_code');
            }
            
            if (Schema::hasColumn('sections', 'capacity') && !Schema::hasColumn('sections', 'number_of_students')) {
                $table->renameColumn('capacity', 'number_of_students');
            }
            
            if (Schema::hasColumn('sections', 'status')) {
                DB::statement('UPDATE sections SET status = "active" WHERE status IS NULL');
                $table->string('status')->default('active')->change();
            }
            
            if (Schema::hasColumn('sections', 'delivery_method')) {
                DB::statement('UPDATE sections SET delivery_method = "in-person" WHERE delivery_method IS NULL');
                $table->string('delivery_method')->default('in-person')->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            if (Schema::hasColumn('sections', 'section_code')) {
                $table->renameColumn('section_code', 'section_number');
            }
            
            if (Schema::hasColumn('sections', 'number_of_students')) {
                $table->renameColumn('number_of_students', 'capacity');
            }
            
            if (Schema::hasColumn('sections', 'status')) {
                $table->string('status')->nullable()->change();
            }
            
            if (Schema::hasColumn('sections', 'delivery_method')) {
                $table->string('delivery_method')->nullable()->change();
            }
        });
    }
}; 