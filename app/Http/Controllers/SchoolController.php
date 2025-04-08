<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SchoolController extends Controller
{
    // GET /schools
    public function index()
    {
        $this->authorize('viewAny', School::class);

        $user = Auth::user();

        // If super admin, show all schools
        if ($user->role->name === 'super_admin') {
            $schools = School::all();
        } else {
            // For school admins, only show their own school
            $schools = School::where('id', $user->school_id)->get();
        }

        return Inertia::render('Schools/Index', [
            'schools' => $schools,
        ]);
    }

    // GET /schools/create
    public function create()
    {
        $this->authorize('create', School::class);
        return Inertia::render('Schools/Create');
    }

    // POST /schools
    public function store(Request $request)
    {
        $this->authorize('create', School::class);

        // Validate the request using the School model validation rules
        $validated = $request->validate(School::validationRules());

        // Prepare settings data
        $this->prepareJsonFields($validated);

        $school = School::create($validated);

        return response()->json([
            'message' => 'School created successfully',
            'school' => $school
        ], 201);
    }

    // GET /schools/{school}/edit
    public function edit(School $school)
    {
        $this->authorize('update', $school);

        $school->loadCount(['users', 'departments', 'buildings', 'terms']);
        $totalCourses = $school->departments()->withCount('courses')->get()->sum('courses_count');

        return Inertia::render('Schools/Edit', [
            'school' => $school,
            'stats' => [
                'total_users' => $school->users_count,
                'total_departments' => $school->departments_count,
                'total_buildings' => $school->buildings_count,
                'total_courses' => $totalCourses,
                'total_active_terms' => $school->terms_count
            ]
        ]);
    }

    // PUT /schools/{school}
    public function update(Request $request, School $school)
    {
        $this->authorize('update', $school);

        // Validate the request using the School model validation rules
        $validated = $request->validate(School::validationRules($school->id));

        // Prepare settings data
        $this->prepareJsonFields($validated);

        $school->update($validated);

        return redirect()->route('schools.edit', $school)->with('success', 'School updated successfully');
    }

    // DELETE /schools/{school}
    public function destroy(School $school)
    {
        $this->authorize('delete', $school);
        $school->delete();

        return redirect()->route('schools.index')->with('success', 'School deleted successfully.');
    }

    // GET schools/{school}
    public function show(School $school)
    {
        $this->authorize('view', $school);

        $school->loadCount(['users', 'terms', 'buildings']);

        return Inertia::render('Schools/Show', [
            'school_info' => [
                'id' => $school->id,
                'name' => $school->name,
                'email' => $school->email,
                'code' => $school->code,
                'website_url' => $school->website_url,
                'logo_url' => $school->logo_url,
                'description' => $school->description,
                'users' => $school->users_count,
                'terms' => $school->terms_count,
                'buildings' => $school->buildings_count,
            ],
        ]);
    }

    /**
     * Prepare JSON fields for storing in the database
     *
     * @param array $data The validated data
     * @return void
     */
    private function prepareJsonFields(&$data)
    {
        if (isset($data['settings']) && is_array($data['settings'])) {
            // Set default values for any missing fields
            $data['settings'] = array_merge([
                'default_language' => 'en',
                'default_course_capacity' => '30',
                'registration_window_days' => '30',
                'email_notifications' => 'all',
                'reminder_days' => '7'
            ], $data['settings']);
        }
    }
}
