# Database Seeders

This directory contains the database seeders for the application. Seeders are used to populate the database with sample data.

## Seeder Organization

The seeders are organized in a logical, consolidated way to make them easier to maintain and understand:

1. **DatabaseSeeder.php** - The main seeder that coordinates all other seeders and seeds core data like roles, users, schools, etc.
2. **BuildingSeeder.php** - Handles all physical space data (buildings, floors, rooms, and room features)
3. **CourseSeeder.php** - Handles all course-related data (courses, sections, etc.)
4. **ScheduleSeeder.php** - Handles all schedule-related data (primary and weekly schedules)

## How to Use

To run all seeders, use:

```bash
php artisan db:seed
```

To run a specific seeder, use:

```bash
php artisan db:seed --class=ScheduleSeeder
```

## Seeder Execution Order

When running `php artisan db:seed`, the seeders are executed in the following order:

1. Core data is seeded first (roles, users, schools, departments, majors, terms)
2. Buildings, floors, rooms, and room features are seeded
3. Courses and sections are created
4. Schedules are assigned to sections

## Sample Data

The seeders create the following sample data:

- **Schools**: Temple University (main campus) and Temple University Japan
- **Users**: Super Admin, School Admins, Professors, and Students
- **Departments**: Computer Science, Electrical Engineering, Business, Asian Studies, etc.
- **Buildings**: Main Building and Science Building for each school
- **Courses**: Various courses for each department
- **Sections**: Sections for active terms with professors
- **Schedules**: Class schedules with different patterns (MWF, TR, etc.)

## Login Credentials

The following login credentials are created by the seeders:

- **Super Admin**: super@admin.com / password
- **Temple Admin**: temple@admin.com / password
- **TUJ Admin**: tuj@admin.com / password 
