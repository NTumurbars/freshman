<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\{
    SchoolController,
    DepartmentController,
    MajorController,
    ProfessorProfileController,
    TermController,
    CourseController,
    SectionController,
    CourseRegistrationController,
    RoomController,
    ScheduleController,
    RoomFeatureController,
    ProfileController,
    UserController
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', fn () => Inertia::render('Welcome'))->name('welcome');

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Authenticated & Verified Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard & Profile Routes
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    /*
    |--------------------------------------------------------------------------
    | Super Admin Routes (Global Write Actions)
    |--------------------------------------------------------------------------
    | Super Admin can manage schools at the top level.
    */
    Route::middleware('role:super_admin')->group(function () {
        Route::resource('schools', SchoolController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | Nested School Routes for School-Specific Write Actions
    |--------------------------------------------------------------------------
    | Resources that belong to a specific school are nested under /schools/{school}.
    | Only users with roles super_admin, school_admin, or major_coordinator can create/update these.
    */
    Route::middleware('role:super_admin,school_admin,major_coordinator')->group(function () {
        // Departments
        Route::resource('schools.departments', DepartmentController::class)
            ->scoped(['department' => 'id'])
            ->except(['index', 'show']);

        // Terms
        Route::resource('schools.terms', TermController::class)
            ->scoped(['term' => 'id'])
            ->except(['index', 'show']);

        // Courses
        Route::resource('schools.courses', CourseController::class)
            ->scoped(['course' => 'id'])
            ->except(['index', 'show']);

        // Sections
        Route::resource('schools.sections', SectionController::class)
            ->scoped(['section' => 'id'])
            ->except(['index', 'show']);

        // Rooms
        Route::resource('schools.rooms', RoomController::class)
            ->scoped(['room' => 'id'])
            ->except(['index', 'show']);

        // Schedules
        Route::resource('schools.schedules', ScheduleController::class)
            ->scoped(['schedule' => 'id'])
            ->except(['index', 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | Global Write Actions Not Nested Under School
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super_admin,school_admin')->group(function () {
        // Users are global; filtering will help super admins.
        Route::resource('users', UserController::class);
        // Majors can be managed globally (or nest them under departments if preferred)
        Route::resource('majors', MajorController::class)->except(['index', 'show']);
    });

    Route::middleware('role:super_admin,school_admin,professor')->group(function () {
        Route::resource('professor-profiles', ProfessorProfileController::class)->except(['index', 'show']);
    });

    Route::middleware('role:super_admin,school_admin,student')->group(function () {
        Route::resource('course-registrations', CourseRegistrationController::class)->except(['index', 'show']);
    });


    Route::resource('room-features', RoomFeatureController::class)->only(['index', 'show']);

    /*
    |--------------------------------------------------------------------------
    | Read-Only Routes (Index & Show) for Nested School Resources
    |--------------------------------------------------------------------------
    | These routes are accessible to all authenticated users.
    */
    Route::middleware('auth')->group(function () {
        // Departments (read-only)
        Route::get('/schools/{school}/departments', [DepartmentController::class, 'index'])
            ->name('schools.departments.index');
        Route::get('/schools/{school}/departments/{department}', [DepartmentController::class, 'show'])
            ->name('schools.departments.show');

        // Terms (read-only)
        Route::get('/schools/{school}/terms', [TermController::class, 'index'])
            ->name('schools.terms.index');
        Route::get('/schools/{school}/terms/{term}', [TermController::class, 'show'])
            ->name('schools.terms.show');

        // Courses (read-only)
        Route::get('/schools/{school}/courses', [CourseController::class, 'index'])
            ->name('schools.courses.index');
        Route::get('/schools/{school}/courses/{course}', [CourseController::class, 'show'])
            ->name('schools.courses.show');

        // Sections (read-only)
        Route::get('/schools/{school}/sections', [SectionController::class, 'index'])
            ->name('schools.sections.index');
        Route::get('/schools/{school}/sections/{section}', [SectionController::class, 'show'])
            ->name('schools.sections.show');

        // Rooms (read-only)
        Route::get('/schools/{school}/rooms', [RoomController::class, 'index'])
            ->name('schools.rooms.index');
        Route::get('/schools/{school}/rooms/{room}', [RoomController::class, 'show'])
            ->name('schools.rooms.show');

        // Schedules (read-only)
        Route::get('/schools/{school}/schedules', [ScheduleController::class, 'index'])
            ->name('schools.schedules.index');
        Route::get('/schools/{school}/schedules/{schedule}', [ScheduleController::class, 'show'])
            ->name('schools.schedules.show');
    });
});
