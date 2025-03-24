<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

use App\Models\User;

class DatabaseSeeder extends Seeder




{
    /**
     * Seed the application's database.
     */
    public function run()
    {
        Role::updateOrCreate(['name' => 'super_admin']);
        Role::updateOrCreate(['name' => 'school_admin']);
        Role::updateOrCreate(['name' => 'major_coordinator']);
        Role::updateOrCreate(['name' => 'professor']);
        Role::updateOrCreate(['name' => 'student']);



        $superAdminRole = Role::firstOrCreate(
            ['name' => 'super_admin']
        );


        $user = User::updateOrCreate(
            ['email' => 'uni@man.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role_id' => $superAdminRole->id,
                // 'school_id' => null,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );


        $this->command->info('Super admin user: ' . $user->email);
    }
}
