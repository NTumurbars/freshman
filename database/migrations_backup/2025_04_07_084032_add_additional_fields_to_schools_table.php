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
        Schema::table('schools', function (Blueprint $table) {
            // Add code field
            $table->string('code')->nullable()->after('name');

            // Add contact fields
            $table->string('website_url')->nullable()->after('email');
            $table->string('logo_url')->nullable()->after('website_url');
            $table->text('description')->nullable()->after('logo_url');
            $table->string('address')->nullable()->after('description');
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('country')->nullable()->after('state');
            $table->string('postal_code')->nullable()->after('country');
            $table->string('phone')->nullable()->after('postal_code');

            // Add preference fields
            $table->string('timezone')->default('UTC')->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn([
                'code',
                'website_url',
                'logo_url',
                'description',
                'address',
                'city',
                'state',
                'country',
                'postal_code',
                'phone',
                'timezone',
            ]);
        });
    }
};
