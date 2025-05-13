<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\School;
use App\Models\Department;
use App\Models\Major;
use App\Models\ProfessorProfile;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    
    
    public function definition(): array
    {
        $departmentNames = [
            ['name' => 'Biology', 'code' => 'BIO'],
            ['name' => 'Chemistry', 'code' => 'CHEM'],
            ['name' => 'Physics', 'code' => 'PHYS'],
            ['name' => 'Environmental Science', 'code' => 'ENVS'],
            ['name' => 'Mathematics', 'code' => 'MATH'],
            ['name' => 'Computer Science', 'code' => 'CS'],
            ['name' => 'Data Science', 'code' => 'DS'],
            ['name' => 'Statistics', 'code' => 'STAT'],
            ['name' => 'Mechanical Engineering', 'code' => 'ME'],
            ['name' => 'Electrical Engineering', 'code' => 'EE'],
            ['name' => 'Civil Engineering', 'code' => 'CE'],
            ['name' => 'Chemical Engineering', 'code' => 'ChE'],
            ['name' => 'History', 'code' => 'HIST'],
            ['name' => 'Philosophy', 'code' => 'PHIL'],
            ['name' => 'English', 'code' => 'ENG'],
            ['name' => 'Art History', 'code' => 'ARTH'],
            ['name' => 'Religious Studies', 'code' => 'REL'],
            ['name' => 'Psychology', 'code' => 'PSY'],
            ['name' => 'Sociology', 'code' => 'SOC'],
            ['name' => 'Anthropology', 'code' => 'ANTH'],
            ['name' => 'Political Science', 'code' => 'POLI'],
            ['name' => 'Economics', 'code' => 'ECON'],
            ['name' => 'Business Administration', 'code' => 'BUS'],
            ['name' => 'Accounting', 'code' => 'ACCT'],
            ['name' => 'Finance', 'code' => 'FIN'],
            ['name' => 'Marketing', 'code' => 'MKTG'],
            ['name' => 'Management', 'code' => 'MGMT'],
            ['name' => 'Visual Arts', 'code' => 'VART'],
            ['name' => 'Music', 'code' => 'MUS'],
            ['name' => 'Theater', 'code' => 'THTR'],
            ['name' => 'Dance', 'code' => 'DANC'],
            ['name' => 'Creative Writing', 'code' => 'CRWR'],
            ['name' => 'Education', 'code' => 'EDU'],
            ['name' => 'Special Education', 'code' => 'SPED'],
            ['name' => 'Educational Leadership', 'code' => 'EDLD'],
            ['name' => 'Nursing', 'code' => 'NURS'],
            ['name' => 'Public Health', 'code' => 'PH'],
            ['name' => 'Health Administration', 'code' => 'HA'],
            ['name' => 'Kinesiology', 'code' => 'KIN'],
            ['name' => 'Journalism', 'code' => 'JOUR'],
            ['name' => 'Communication Studies', 'code' => 'COMM'],
            ['name' => 'Media Studies', 'code' => 'MEDIA'],
            ['name' => 'Public Relations', 'code' => 'PR'],
            ['name' => 'Law', 'code' => 'LAW'],
            ['name' => 'Public Policy', 'code' => 'PPOL'],
            ['name' => 'Criminology', 'code' => 'CRIM'],
            ['name' => 'International Relations', 'code' => 'INTR'],
        ];
    
        $departmentName = fake()->randomElement($departmentNames);
        return [
            'school_id'=>School::inRandomOrder()->first()->id,
            'name'=>$departmentName['name'],
            'code' =>$departmentName['code'],
            'contact' =>fake()->phoneNumber(),
        ];
    }

    public function newDepartment()
    {
        return $this->state(function (array $attributes) {
            return [
                'school_id'=>School::factory(),
                
            ];
        });
    }

    public function configure()
    {
        return $this->afterCreating(function (Department $department) {
            Major::factory()->create(['department_id' => $department->id,]);
            $departmentid = $department->id;
            $schoolid = $department->school_id;
            User::factory()->professor($departmentid)->create(['school_id'=> $department->school_id]);
        });
    }
    

}
