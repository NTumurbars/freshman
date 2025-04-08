<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Section;
use App\Models\User;

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
        return [
            'section_id'=>Section::factory();
            'student_id' => User::factory()->student()
        ];
    }

    public function newCourseRegistration()
    {
        $currentSection = Section::inRandomOrder()->first();
        $professorId = $currentSection->professor_id;
        $schoolId = User::find($professorId)->school_id;
        return $this->state(function (array $attributes ) use ($currentSection, $schoolId){
            return [
                'section_id'=>$currentSection->id,
                'student_id'=>User::where('school_id', $schoolId)->where('role_id', 5)->inRandomOrder()->first()->id;
            ];
        });
    }
}
