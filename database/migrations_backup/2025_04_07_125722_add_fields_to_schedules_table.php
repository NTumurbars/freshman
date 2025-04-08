<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Schedule;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->string('meeting_pattern')->default(Schedule::PATTERN_SINGLE)->after('end_time');
            $table->string('location_type')->default(Schedule::LOCATION_IN_PERSON)->after('meeting_pattern');
            $table->string('virtual_meeting_url')->nullable()->after('location_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn(['meeting_pattern', 'location_type', 'virtual_meeting_url']);
        });
    }
};
