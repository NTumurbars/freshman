# Freshman Database Seeders

This directory contains database seeders for creating realistic test data for the Freshman application.

## Overview

The seeders create a complete academic ecosystem with two universities, their departments, majors, professors, courses, sections, schedules, students, and course registrations.

## Seeder Sequence

The seeders run in the following order, managed by `DatabaseSeeder.php`:

1. **Core Data (inline in `DatabaseSeeder.php`)**:
   - Roles and admin users
   - Schools (Temple University and Temple Japan)
   - Departments, majors, and terms
   - Initial professor accounts

2. **Specialized Seeders**:
   - `BuildingSeeder.php`: Creates campus buildings, floors, rooms, and room features
   - `CourseSeeder.php`: Creates courses and sections for each department
   - `ScheduleSeeder.php`: Creates realistic class schedules for the sections
   - `StudentSeeder.php`: Creates diverse student population for each school
   - `CourseRegistrationSeeder.php`: Registers students for appropriate courses

## Key Features

- **Realistic Data**: Names, schedules, and academic patterns reflect real-world scenarios
- **School-Specific**: Data is tailored to the location (Philadelphia vs Tokyo)
- **Capacity-Aware**: Respects room capacities and section limits
- **Conflict Avoidance**: Ensures no schedule conflicts in student registrations
- **Diverse Workloads**: Students take 3-5 courses from a variety of subject areas

## Running the Seeders

### Full Database Reset and Seed
```bash
php artisan migrate:fresh --seed
```

### Running Individual Seeders
```bash
php artisan db:seed --class=StudentSeeder
php artisan db:seed --class=CourseRegistrationSeeder
```

## Modifying Seeders

### Adding More Students
To increase the number of students:

1. Open `database/seeders/StudentSeeder.php`
2. Modify the count parameters in the `run()` method:
   ```php
   $this->seedStudentsForSchool($templeSchool, $studentRole, $faker, 100); // Increase from 60
   $this->seedStudentsForSchool($tujSchool, $studentRole, $faker, 80);    // Increase from 40
   ```

### Creating More Courses
To add new courses:

1. Open `database/seeders/CourseSeeder.php`
2. Add course definitions to the `getCoursesForDepartment()` method:
   ```php
   case 'Computer Science':
       return [
           // Existing courses
           ['code' => 'CS101', 'title' => 'Introduction to Computer Science', 'credits' => 3],
           // Add new courses
           ['code' => 'CS150', 'title' => 'Web Development Basics', 'credits' => 3],
       ];
   ```

### Customizing Registration Patterns
To adjust how students register for courses:

1. Open `database/seeders/CourseRegistrationSeeder.php`
2. Modify the coursesToRegister variable to change the course load:
   ```php
   // Increase the range for more courses per student
   $coursesToRegister = rand(4, 6); // Changed from 3-5
   ```

## Default Accounts

The seeders create the following admin accounts for testing:

- **Super Admin**: super@admin.com / password
- **Temple Main Campus Admin**: temple@admin.com / password
- **Temple Japan Admin**: tuj@admin.com / password

Student accounts are generated with emails following the pattern `firstname.lastname@temple.edu` or `firstname.lastname@tuj.temple.edu` and the password "password".

## Contributions

When enhancing the seeders, please ensure:

1. All seeders work together without conflicts
2. Data remains realistic and appropriate for an academic setting
3. Documentation reflects any changes to seeder behavior 
