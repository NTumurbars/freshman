<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Section;
use App\Models\User;
use App\Models\CourseRegistration;
use App\Models\School;
use App\Models\ProfessorProfile;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CourseRegistration>
 */
class CourseRegistrationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $currentSection = Section::inRandomOrder()->first();
        $professorProfile = $currentSection->professor_profile_id;
        $professorUserId = ProfessorProfile::where('id', $professorProfile)->first()->user_id;
        $schoolId = User::find($professorUserId)->school_id;
        return [
            'section_id'=>$currentSection->id,
            'user_id'=>User::where('school_id', $schoolId)->where('role_id', 5)->inRandomOrder()->first()->id,
        ];
    }

    public function newCourseRegistration()
    {
        
        return $this->state(function (array $attributes ) use ($currentSection, $schoolId){
            return [
                'section_id'=>Section::factory(),
                'user_id' => User::factory()->student(),
            ];
        });
    }
}
