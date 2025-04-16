<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Department;
use App\Models\Major;
use App\Models\Course;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Major>
 */
class MajorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $majors = [
            ['name' => 'Accounting', 'code' => 'ACCT'],
            ['name' => 'Anthropology', 'code' => 'ANTH'],
            ['name' => 'Architecture', 'code' => 'ARCH'],
            ['name' => 'Art History', 'code' => 'ARTH'],
            ['name' => 'Biology', 'code' => 'BIOL'],
            ['name' => 'Biomedical Engineering', 'code' => 'BME'],
            ['name' => 'Business Administration', 'code' => 'BUS'],
            ['name' => 'Chemical Engineering', 'code' => 'CHE'],
            ['name' => 'Chemistry', 'code' => 'CHEM'],
            ['name' => 'Civil Engineering', 'code' => 'CIVL'],
            ['name' => 'Communication Studies', 'code' => 'COMM'],
            ['name' => 'Computer Science', 'code' => 'CSCI'],
            ['name' => 'Creative Writing', 'code' => 'CRWT'],
            ['name' => 'Criminal Justice', 'code' => 'CRIM'],
            ['name' => 'Data Science', 'code' => 'DATA'],
            ['name' => 'Design', 'code' => 'DSGN'],
            ['name' => 'Economics', 'code' => 'ECON'],
            ['name' => 'Education', 'code' => 'EDUC'],
            ['name' => 'Electrical Engineering', 'code' => 'ELEC'],
            ['name' => 'English Literature', 'code' => 'ENGL'],
            ['name' => 'Environmental Science', 'code' => 'ENVS'],
            ['name' => 'Film Studies', 'code' => 'FILM'],
            ['name' => 'Finance', 'code' => 'FIN'],
            ['name' => 'Graphic Design', 'code' => 'GRPH'],
            ['name' => 'History', 'code' => 'HIST'],
            ['name' => 'Information Technology', 'code' => 'ITEC'],
            ['name' => 'International Relations', 'code' => 'IR'],
            ['name' => 'Journalism', 'code' => 'JOUR'],
            ['name' => 'Kinesiology', 'code' => 'KIN'],
            ['name' => 'Law', 'code' => 'LAW'],
            ['name' => 'Management', 'code' => 'MGMT'],
            ['name' => 'Marketing', 'code' => 'MKTG'],
            ['name' => 'Mathematics', 'code' => 'MATH'],
            ['name' => 'Mechanical Engineering', 'code' => 'MECH'],
            ['name' => 'Media Studies', 'code' => 'MDST'],
            ['name' => 'Music', 'code' => 'MUSC'],
            ['name' => 'Nursing', 'code' => 'NURS'],
            ['name' => 'Philosophy', 'code' => 'PHIL'],
            ['name' => 'Physics', 'code' => 'PHYS'],
            ['name' => 'Political Science', 'code' => 'POLS'],
            ['name' => 'Psychology', 'code' => 'PSYC'],
            ['name' => 'Public Health', 'code' => 'PUBH'],
            ['name' => 'Public Policy', 'code' => 'PUBL'],
            ['name' => 'Religious Studies', 'code' => 'RLST'],
            ['name' => 'Social Work', 'code' => 'SOCW'],
            ['name' => 'Sociology', 'code' => 'SOCI'],
            ['name' => 'Software Engineering', 'code' => 'SENG'],
            ['name' => 'Statistics', 'code' => 'STAT'],
            ['name' => 'Theater Arts', 'code' => 'THAR'],
            ['name' => 'Urban Planning', 'code' => 'URBP'],
            ['name' => 'Veterinary Science', 'code' => 'VET'],
            ['name' => "Women's and Gender Studies", 'code' => 'WGST'],
        ];
        
        $major = fake()->randomElement($majors);

        return [
            'department_id'=>Department::inRandomOrder()->first()->id,
            'code'=>$major['code'],
            'name'=>$major['name'],
            'description'=>fake()->paragraph(),
        ];
    }

    public function newMajor()
    {
        return $this->state(function (array $attributes) {
            return [
                'department_id'=>Department::factory(),
                
            ];
        });
    }


    public function configure()
    {
        return $this->afterCreating(function (Major $major) {
            Course::factory()->create(['major_id' => $major->id, 'department_id' => $major->department_id]);
        });
    }

}
