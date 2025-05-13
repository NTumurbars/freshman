<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\School;
use App\Models\Role;
use App\Models\User;
use App\Models\ProfessorProfile;
use App\Models\Department;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    public function definition(): array
    {
        return [
            'school_id' => School::inRandomOrder()->first()->id,
            'role_id' => Role::inRandomOrder()->first()->id,
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10)
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function newUser()
    {
        return $this->state(fn (array$attributes) => [
            'school_id'=> School::factory(),
        ]);
    }

    public function student()
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => 5,
            'school_id'=>School::inRandomOrder()->first()->id,
        ]);
    }

    public function professor($departmentid = null)
    {
        
        return $this->state(function (array $attributes) {
            return [
                'role_id' => 4,
            ];
        })->afterCreating(function (User $user) use ($departmentid){
            if(!$departmentid)
            {
                $departmentid = Department::where('school_id', $user->school_id)->inRandomOrder()->first()->id;
            }
            ProfessorProfile::factory()->create([
                'user_id' => $user->id,
                'department_id' => $departmentid,
            ]);
            
        });
    }

    /*
    public function configure()
    {
        if(static::$departmentid)
        {
            $departmentid = static::$departmentid;
            fwrite(STDOUT, "\nIF TRUE LOL\n");
        }else{
            $departmentid = Department::inRandomOrder()->first()->id;
            fwrite(STDOUT, "\nIF NOT LOL\n");
        }
        fwrite(STDOUT, "\n\nIn user factory Department ID is now: " . $departmentid . "\n");
        return $this->afterCreating(function (User $user) use ($departmentid){
            if ($user->role && $user->role->name === 'professor') {
                ProfessorProfile::factory()->create([
                    'user_id' => $user->id,
                    'department_id' => $departmentid,
                ]);
            }
        });
    }
        */



}
