<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Models\User;
use App\Models\School;
use Illuminate\Support\Facades\Auth;

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
    UserController
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'auth' => [
            'user' => Auth::user(),
        ],
        'users' => User::count(),
        'schools' => School::count(),
    ]);
})->name('welcome');

Route::get('/dashboard/all/stats', [StatsController::class, 'superUser'])->name('superuser.stats');
Route::get('/dashboard/admin/stats', [StatsController::class, 'schoolAdmin'])->name('school.admin.stats');

require __DIR__ . '/auth.php';

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('api')->group(function () {
    // API route for fetching buildings by school
    Route::get('/schools/{school}/buildings', function (School $school) {
        return $school->buildings()
            ->with('school')
            ->withCount('floors')
            ->withCount('rooms')
            ->get()
            ->map(function($building) {
                return [
                    'id' => $building->id,
                    'name' => $building->name,
                    'stats' => [
                        'floors' => $building->floors_count,
                        'rooms' => $building->rooms_count,
                    ],
                    'school_id' => $building->school_id,
                    'school_name' => $building->school->name
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
    // Dashboard
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
        'users' => UserController::class,
    ]);

    // Nested Resources Under Schools
    Route::prefix('schools/{school}')->group(function () {
        Route::resources([
            'departments' => DepartmentController::class,
            'majors' => MajorController::class,
            'terms' => TermController::class,
            'courses' => CourseController::class,
            'sections' => SectionController::class,
            'rooms' => RoomController::class,
            'room-features' => RoomFeatureController::class,
            'schedules' => ScheduleController::class,
            'professor-profiles' => ProfessorProfileController::class,
            'course-registrations' => CourseRegistrationController::class,
            'buildings' => BuildingController::class,
            'buildings.floors' => FloorController::class,
            'buildings.floors.rooms' => RoomController::class,
        ]);
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
