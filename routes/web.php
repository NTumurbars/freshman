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
    UserController
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
Route::get('/dashboard/admin/stats', [StatsController::class, 'schoolAdmin'])->name('school.admin.stats');
Route::get('/dashboard/professor/stats', [StatsController::class, 'professorStats'])->name('professor.stats');

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

    // Student enrollments API
    Route::get('/student/enrollments', function () {
        $user = Auth::user();
        if ($user->role->name !== 'student') {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        try {
            $enrollments = \App\Models\CourseRegistration::where('student_id', $user->id)
                ->with(['section.course', 'section.professor_profile.user', 'section.schedules.room'])
                ->get();

            return response()->json(['enrollments' => $enrollments]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error fetching enrollments: ' . $e->getMessage()], 500);
        }
    })->name('api.student.enrollments');
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Authentication & Email Verification)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard View - redirects based on role
    Route::get('/dashboard', function() {
        $user = Auth::user();
        if ($user->role->name === 'student') {
            return redirect()->route('student.dashboard');
        }
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Student Dashboard
    Route::get('/student/dashboard', function() {
        return Inertia::render('Student/Dashboard');
    })->name('student.dashboard');

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

        Route::resources([
            'departments'             => DepartmentController::class,
            'majors'                  => MajorController::class,
            'terms'                   => TermController::class,
            'courses'                 => CourseController::class,
            'sections'                => SectionController::class,
            'rooms'                   => RoomController::class,
            'roomfeatures'            => RoomFeatureController::class,
            'schedules'               => ScheduleController::class,
            'professor-profiles'      => ProfessorProfileController::class,
            'course-registrations'    => CourseRegistrationController::class,
            'buildings'               => BuildingController::class,
            'buildings.floors'        => FloorController::class,
            'buildings.floors.rooms'  => RoomController::class,
        ]);

        // Student course registration routes
        Route::delete('sections/{section}/drop', function(School $school, App\Models\Section $section) {
            $user = Auth::user();
            if ($user->role->name !== 'student') {
                return response()->json(['error' => 'Not authorized'], 403);
            }

            $registration = App\Models\CourseRegistration::where('student_id', $user->id)
                ->where('section_id', $section->id)
                ->first();

            if ($registration) {
                $registration->delete();
                return response()->json(['success' => true]);
            }

            return response()->json(['error' => 'Registration not found'], 404);
        })->name('course-registrations.drop');

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
