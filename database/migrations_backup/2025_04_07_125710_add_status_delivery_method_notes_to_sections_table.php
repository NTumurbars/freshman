<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Section;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->string('status')->default(Section::STATUS_ACTIVE)->after('number_of_students');
            $table->string('delivery_method')->default(Section::DELIVERY_IN_PERSON)->after('status');
            $table->text('notes')->nullable()->after('delivery_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->dropColumn(['status', 'delivery_method', 'notes']);
        });
    }
};
