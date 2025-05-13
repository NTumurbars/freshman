<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\CourseRegistration;
use App\Models\Section;
use App\Models\User;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\School;
use Carbon\Carbon;
use App\Models\Department;
use App\Models\Course;

class CourseRegistrationController extends Controller
{
    // GET /course-registrations
    public function index()
    {
        $this->authorize('viewAny', CourseRegistration::class);

        $user = Auth::user();

        // If user is a student, show student registration view
        if ($user->role->name === 'student') {
            $currentTerm = Term::where('school_id', $user->school_id)
                ->where('is_active', true)
                ->first();

            if (!$currentTerm) {
                return back()->with('error', 'No active term found.');
            }

            // Get available sections for the current term
            $sections = Section::with(['course', 'professor_profile.user', 'schedules.room', 'courseRegistrations'])
                ->whereHas('term', function ($query) use ($currentTerm) {
                    $query->where('id', $currentTerm->id);
                })
                ->where('status', 'active')
                ->get();

            // Get student's registrations
            $registrations = CourseRegistration::with(['section.course', 'section.professor_profile.user', 'section.schedules.room'])
                ->where('user_id', $user->id)
                ->whereHas('section.term', function ($query) use ($currentTerm) {
                    $query->where('id', $currentTerm->id);
                })
                ->get();

            return Inertia::render('CourseRegistration/Index', [
                'sections' => $sections,
                'registrations' => $registrations,
                'currentTerm' => $currentTerm,
            ]);
        }

        // If user is a professor, show professor students view
        if ($user->role->name === 'professor') {
            // Find the current active term
            $currentTerm = Term::where('school_id', $user->school_id)
                ->where('is_active', true)
                ->first();

            if (!$currentTerm) {
                $currentTerm = Term::where('school_id', $user->school_id)
                    ->orderBy('start_date', 'desc')
                    ->first();
            }

            // Get professor profile
            $professorProfile = $user->professor_profile;

            if (!$professorProfile) {
                return back()->with('error', 'Professor profile not found.');
            }

            // Get sections taught by this professor in the current term
            $sections = Section::with(['course', 'term', 'courseRegistrations.student'])
                ->where('professor_profile_id', $professorProfile->id)
                ->when($currentTerm, function ($query) use ($currentTerm) {
                    return $query->where('term_id', $currentTerm->id);
                })
                ->get();

            // Get all terms for filtering
            $terms = Term::where('school_id', $user->school_id)
                ->orderBy('start_date', 'desc')
                ->get();

            return Inertia::render('CourseRegistrations/ProfessorView', [
                'sections' => $sections,
                'currentTerm' => $currentTerm,
                'terms' => $terms,
                'school' => $user->school
            ]);
        }

        // For admin view, show all registrations
        $registrations = CourseRegistration::with(['section', 'user'])->get();
        return Inertia::render('CourseRegistrations/Index', ['registrations' => $registrations]);
    }

    // GET /course-registrations/create
    public function create()
    {
        $this->authorize('create', CourseRegistration::class);
        $sections = Section::all();
        $students = User::whereHas('role', function ($q) {
            $q->where('name', 'student');
        })->get();
        return Inertia::render('CourseRegistrations/Create', [
            'sections' => $sections,
            'students' => $students,
        ]);
    }

    // POST /course-registrations
    public function store(Request $request)
    {
        $this->authorize('create', CourseRegistration::class);

        $user = Auth::user();
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'user_id' => $user->role->name === 'student' ? 'prohibited' : 'required|exists:users,id',
        ]);

        // If user is a student, use their ID
        if ($user->role->name === 'student') {
            $data['user_id'] = $user->id;
        }

        // Check if section has available capacity
        $section = Section::findOrFail($data['section_id']);
        if ($section->students_count >= $section->capacity) {
            return back()->with('error', 'This section is full.');
        }

        // Check if student is already registered for this section
        $existingRegistration = CourseRegistration::where('user_id', $data['user_id'])
            ->where('section_id', $data['section_id'])
            ->exists();

        if ($existingRegistration) {
            return back()->with('error', 'Already registered for this section.');
        }

        // Check for schedule conflicts
        $studentRegistrations = CourseRegistration::with('section.schedules')
            ->where('user_id', $data['user_id'])
            ->whereHas('section', function ($query) use ($section) {
                $query->where('term_id', $section->term_id);
            })
            ->get();

        foreach ($studentRegistrations as $registration) {
            foreach ($registration->section->schedules as $existingSchedule) {
                foreach ($section->schedules as $newSchedule) {
                    if (
                        $existingSchedule->day_of_week === $newSchedule->day_of_week &&
                        (
                            ($newSchedule->start_time >= $existingSchedule->start_time && $newSchedule->start_time < $existingSchedule->end_time) ||
                            ($newSchedule->end_time > $existingSchedule->start_time && $newSchedule->end_time <= $existingSchedule->end_time) ||
                            ($newSchedule->start_time <= $existingSchedule->start_time && $newSchedule->end_time >= $existingSchedule->end_time)
                        )
                    ) {
                        return back()->with('error', 'Schedule conflicts with another registered course.');
                    }
                }
            }
        }

        CourseRegistration::create($data);
        return back()->with('success', 'Registration created successfully');
    }

    // GET /course-registrations/{id}/edit
    public function edit($id)
    {
        $registration = CourseRegistration::findOrFail($id);
        $this->authorize('update', $registration);
        $sections = Section::all();
        $students = User::whereHas('role', function ($q) {
            $q->where('name', 'student');
        })->get();
        return Inertia::render('CourseRegistrations/Edit', [
            'registration' => $registration,
            'sections' => $sections,
            'students' => $students,
        ]);
    }

    // PUT /course-registrations/{id}
    public function update(Request $request, $id)
    {
        $registration = CourseRegistration::findOrFail($id);
        $this->authorize('update', $registration);
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $registration->update($data);
        return redirect()->route('course-registrations.index')->with('success', 'Registration updated successfully');
    }

    // DELETE /course-registrations/{id}
    public function destroy($id)
    {
        $registration = CourseRegistration::findOrFail($id);
        $this->authorize('delete', $registration);
        $registration->delete();
        return redirect()->route('course-registrations.index')->with('success', 'Registration deleted successfully');
    }

    /**
     * Display the student course registration view
     */
    public function studentIndex(School $school)
    {
        $user = Auth::user();

        if ($user->role->name !== 'student') {
            abort(403, 'Only students can access this page');
        }

        $currentTerm = Term::where('school_id', $school->id)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->first();

        if (!$currentTerm) {
            return back()->with('error', 'No active term found.');
        }

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $schoolCourseIds = Course::whereIn('department_id', $schoolDepartmentIds)
            ->where('is_active', true)
            ->pluck('id');

        // Get available sections for the current term
        $sections = Section::whereIn('course_id', $schoolCourseIds)
            ->where('term_id', $currentTerm->id)
            ->whereIn('status', ['open', 'waitlist'])
            ->with([
                'course.department',
                'professor_profile.user',
                'schedules.room.floor.building',
                'courseRegistrations'
            ])
            ->get();

        // Add debug logging
        Log::info('Course Registration Query Debug', [
            'school_id' => $school->id,
            'department_ids' => $schoolDepartmentIds,
            'course_ids' => $schoolCourseIds,
            'term_id' => $currentTerm->id,
            'sections_found' => $sections->count(),
            'sections_raw' => $sections->pluck('id'),
            'section_statuses' => $sections->pluck('status'),
        ]);

        // Get student's registrations
        $registrations = CourseRegistration::with([
                'section.course',
                'section.professor_profile.user',
                'section.schedules.room'
            ])
            ->where('user_id', $user->id)
            ->whereHas('section', function ($query) use ($currentTerm) {
                $query->where('term_id', $currentTerm->id);
            })
            ->get();

        Log::info('Course Registration Debug', [
            'user_id' => $user->id,
            'school_id' => $school->id,
            'current_term' => $currentTerm,
            'sections_count' => $sections->count(),
            'registrations_count' => $registrations->count(),
            'term_id' => $currentTerm->id,
        ]);

        return Inertia::render('CourseRegistration/Index', [
            'sections' => $sections,
            'registrations' => $registrations,
            'currentTerm' => $currentTerm,
            'debug' => [
                'user_id' => $user->id,
                'school_id' => $school->id,
                'sections_count' => $sections->count(),
                'registrations_count' => $registrations->count(),
            ],
        ]);
    }

    /**
     * Display the professor's students view filtered by term
     */
    public function professorStudents(School $school, Request $request)
    {
        $user = Auth::user();

        if ($user->role->name !== 'professor') {
            abort(403, 'Only professors can access this page');
        }

        // Find the professor profile
        $professorProfile = $user->professor_profile;

        if (!$professorProfile) {
            return back()->with('error', 'Professor profile not found.');
        }

        // Get the term to filter by (default to current)
        $termId = $request->input('term_id');

        $currentTerm = null;
        if ($termId) {
            $currentTerm = Term::find($termId);
        }

        if (!$currentTerm) {
            // Get current active term
            $currentTerm = Term::where('school_id', $school->id)
                ->where('is_active', true)
                ->first();

            if (!$currentTerm) {
                // Fallback to most recent term
                $currentTerm = Term::where('school_id', $school->id)
                    ->orderBy('start_date', 'desc')
                    ->first();
            }
        }

        // Get all terms for the filter dropdown
        $terms = Term::where('school_id', $school->id)
            ->orderBy('start_date', 'desc')
            ->get();

        // Get sections taught by this professor in the selected term
        $sectionsQuery = Section::with([
                'course',
                'term',
                'courseRegistrations.student'
            ])
            ->where('professor_profile_id', $professorProfile->id)
            ->when($currentTerm, function ($query) use ($currentTerm) {
                return $query->where('term_id', $currentTerm->id);
            });

        $sections = $sectionsQuery->get();

        // Format the section data to ensure student information is properly included
        $formattedSections = $sections->map(function($section) {
            return array_merge($section->toArray(), [
                'courseRegistrations' => $section->courseRegistrations->map(function($registration) {
                    return [
                        'id' => $registration->id,
                        'student' => $registration->student ? [
                            'id' => $registration->student->id,
                            'name' => $registration->student->name,
                            'email' => $registration->student->email
                        ] : null
                    ];
                })
            ]);
        });

        // Log for debugging
        Log::info('Professor students view', [
            'professor_id' => $user->id,
            'school_id' => $school->id,
            'term_id' => $currentTerm ? $currentTerm->id : null,
            'sections_count' => $sections->count(),
            'sections' => $sections->pluck('section_code'),
            'registrations_sample' => $sections->first() ? $sections->first()->courseRegistrations->take(2) : null
        ]);

        return Inertia::render('CourseRegistrations/ProfessorView', [
            'sections' => $formattedSections,
            'currentTerm' => $currentTerm,
            'terms' => $terms,
            'school' => $school
        ]);
    }
}
