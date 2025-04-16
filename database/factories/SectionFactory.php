<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Course;
use App\Models\Term;
use App\Models\User;
use App\Models\Section;
use App\Models\ProfessorProfile;
use App\Models\School;
use App\Models\Department;
use App\Models\Schedule;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Section>
 */
class SectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        

        $schoolid = School::inRandomOrder()->first()->id;
        $departmentid = Department::where('school_id', $schoolid)->inRandomOrder()->first()->id;
        $courseid = Course::where('department_id', $departmentid)->inRandomOrder()->first()->id;
        $termid = Term::where('school_id', $schoolid)->inRandomOrder()->first()->id;
        $professorid = ProfessorProfile::where('department_id', $departmentid)->inRandomOrder()->first()->id;
        return [
            'course_id'=>$courseid,
            'term_id'=>$termid,
            'professor_profile_id'=>$professorid,
            'section_code'=>fake()->bothify('?##'),
            'status' => fake()->randomElement(['active', 'inactive']),
            'delivery_method' => fake()->randomElement(['online', 'in person']),
            'notes' => fake() ->paragraph(),
            'capacity' => fake()->numberBetween(5, 100),
        ];
    }

    public function newSection()
    {
        $schoolid = School::factory();
        $departmentid = Department::where('school_id', $schoolid)->first()->id;
        $courseid = Course::where('department_id', $departmentid)->first()->id;
        
        return $this->state(function (array $attributes) use ($courseid, $termid, $departmentid) {
            return [
                'course_id'=>$courseid,
                'term_id'=>Term::where('school_id', $schoolid)->first()->id,
                'professor_profile_id'=>ProfessorProfile::where('department_id', $departmentid),

            ];
        });
    }

    public function configure()
    {
        return $this->afterCreating(function (Section $section) {
            Schedule::factory()->newSchedule()->create(['section_id' => $section->id,]);
        });
    }
}
