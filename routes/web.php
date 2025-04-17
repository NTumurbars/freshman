<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Models
use App\Models\User;
use App\Models\School;
use App\Models\Floor;

// Controllers
use App\Http\Controllers\{
    BuildingController,
    SchoolController,
    DepartmentController,
    MajorController,
    ProfessorProfileController,
    TermController,
    CourseController,
    SectionController,
    CourseRegistrationController,
    FloorController,
    RoomController,
    ScheduleController,
    RoomFeatureController,
    ProfileController,
    ReportController,
    StatsController,
    UserController,
    ProgramController
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'auth'    => ['user' => Auth::user()],
        'users'   => User::count(),
        'schools' => School::count(),
    ]);
})->name('welcome');

Route::get('/dashboard/all/stats', [StatsController::class, 'superUser'])->name('superuser.stats');
Route::get('/dashboard/admin/stats', [StatsController::class, 'schoolAdmin'])->name('dashboard.admin.stats');
// Using the school-specific route defined below instead
// Route::get('/dashboard/professor/stats', [StatsController::class, 'professorStats'])->name('professor.stats');

require __DIR__ . '/auth.php';

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('api')->group(function () {
    // API route for fetching buildings by school with associated stats
    Route::get('/schools/{school}/buildings', function (School $school) {
        return $school->buildings()
            ->with('school')
            ->withCount('floors')
            ->withCount('rooms')
            ->get()
            ->map(function ($building) {
                return [
                    'id'          => $building->id,
                    'name'        => $building->name,
                    'stats'       => [
                        'floors' => $building->floors_count,
                        'rooms'  => $building->rooms_count,
                    ],
                    'school_id'   => $building->school_id,
                    'school_name' => $building->school->name,
                ];
            });
    })->name('api.buildings.list');
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Authentication & Email Verification)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard View
    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.view');

    // Global Resource Routes
    Route::resources([
        'schools' => SchoolController::class,
        'users'   => UserController::class,
    ]);

    // Professor Profile Update (Global Route)
    Route::post('/users/{userId}/professor-profile', [ProfessorProfileController::class, 'update'])
        ->name('professor_profile.update');

    // Nested Resources Under Schools
    Route::prefix('schools/{school}')->group(function () {
        // Section calendar view - place first to avoid resource route conflicts
        Route::get('sections/calendar', [SectionController::class, 'calendar'])
            ->name('sections.calendar');

        // Add new professor students route
        Route::get('professor/students', [CourseRegistrationController::class, 'professorStudents'])
            ->name('professor.students');

        Route::resources([
            'departments'             => DepartmentController::class,
            'majors'                 => MajorController::class,
            'terms'                  => TermController::class,
            'courses'                => CourseController::class,
            'sections'               => SectionController::class,
            'rooms'                  => RoomController::class,
            'roomfeatures'           => RoomFeatureController::class,
            'schedules'              => ScheduleController::class,
            'professor-profiles'     => ProfessorProfileController::class,
            'course-registrations'   => CourseRegistrationController::class,
            'buildings'              => BuildingController::class,
            'buildings.floors'       => FloorController::class,
            'buildings.floors.rooms' => RoomController::class,
        ]);

        // Student course registration view
        Route::get('student/course-registration', [CourseRegistrationController::class, 'studentIndex'])
            ->name('student.course-registration');

        // Batch schedule creation routes – adding an alias for flexibility
        Route::post('schedules-batch', [ScheduleController::class, 'storeBatch'])
            ->name('schedules.store-batch');
        Route::post('api/schedules/batch', [ScheduleController::class, 'storeBatch'])
            ->name('api.schedules.batch');

        // Delete all schedules for a section
        Route::delete('sections/{section}/schedules', [ScheduleController::class, 'destroyAll'])
            ->name('schedules.destroyAll');

        // Direct route for creating a room associated with a floor
        Route::get('rooms/create/{floor}', [RoomController::class, 'create'])
            ->name('rooms.create.with.floor');

        // Stats routes
        Route::get('api/stats/superuser', [StatsController::class, 'superUser'])
            ->name('superuser.stats');
        Route::get('api/stats/school-admin', [StatsController::class, 'schoolAdmin'])
            ->name('school.admin.stats');
        Route::get('api/stats/professor', [StatsController::class, 'professor'])
            ->name('professor.stats');
        Route::get('api/stats/student', [StatsController::class, 'student'])
            ->name('student.stats');
    });
});

/*
|--------------------------------------------------------------------------
| Email Verification Routes
|--------------------------------------------------------------------------
*/
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect('/profile/edit');
})->middleware(['auth', 'signed'])->name('verification.verify');
