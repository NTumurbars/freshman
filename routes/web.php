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

    // Dashboard
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    // Profile Management
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
    });

    /*
    |--------------------------------------------------------------------------
    | Super Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super_admin')->group(function () {
        Route::resource('schools', SchoolController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin (Super Admin + School Admin)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super_admin,school_admin')->group(function () {
        Route::resource('users', UserController::class);
        Route::resource('departments', DepartmentController::class)->except(['index', 'show']);
        Route::resource('majors', MajorController::class)->except(['index', 'show']);
        Route::resource('terms', TermController::class)->except(['index', 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | Major Coordinator (Super Admin, School Admin, Major Coordinator)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super_admin,school_admin,major_coordinator')->group(function () {
        Route::resource('courses', CourseController::class)->except(['index', 'show']);
        Route::resource('sections', SectionController::class)->except(['index', 'show']);
        Route::resource('rooms', RoomController::class)->except(['index', 'show']);
        Route::resource('room-features', RoomFeatureController::class)->except(['index', 'show']);
        Route::resource('schedules', ScheduleController::class)->except(['index', 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | Professor Management (Super Admin, School Admin, Professor)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super_admin,school_admin,professor')->group(function () {
        Route::resource('professor-profiles', ProfessorProfileController::class)->except(['index', 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | Course Registration (Super Admin, School Admin, Student)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super_admin,school_admin,student')->group(function () {
        Route::resource('course-registrations', CourseRegistrationController::class)->except(['index', 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | Read-Only (Index, Show) Routes: All Verified Users
    |--------------------------------------------------------------------------
    */
    Route::resources([
        'departments'          => DepartmentController::class,
        'majors'               => MajorController::class,
        'terms'                => TermController::class,
        'courses'              => CourseController::class,
        'sections'             => SectionController::class,
        'rooms'                => RoomController::class,
        'room-features'        => RoomFeatureController::class,
        'professor-profiles'   => ProfessorProfileController::class,
        'course-registrations' => CourseRegistrationController::class,
        'schedules'            => ScheduleController::class,
    ], ['only' => ['index', 'show']]);
});
