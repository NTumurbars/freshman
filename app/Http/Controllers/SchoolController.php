<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SchoolController extends Controller
{
    // GET /schools
    public function index()
    {
        $this->authorize('viewAny', School::class);
        $user = Auth::user();
        if ($user->role->name === 'super_admin') {
            $schools = School::all();
        } else {
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

        $school = School::create($validated);

        return redirect()->route('schools.index')->with('success', 'School created successfully');
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

        $school->loadCount(['users', 'terms', 'buildings', 'departments']);

        // Get admin users for this school with debugging
        try {
            // Find all admin-related roles
            $adminRoleIds = \App\Models\Role::whereIn('name', [
                'admin',
                'school_admin',
                'administrator',
                'super_admin'
            ])->pluck('id')->toArray();

            if (empty($adminRoleIds)) {
                Log::warning('No admin roles found in the system');
                $adminUsers = [];
            } else {
                // Use the role IDs to get users
                $adminUsers = $school->users()
                    ->whereIn('role_id', $adminRoleIds)
                    ->select('id', 'name', 'email', 'created_at')
                    ->get()
                    ->toArray(); // Convert to array for easier passing to frontend

                Log::info('School admin query', [
                    'school_id' => $school->id,
                    'admin_role_ids' => $adminRoleIds,
                    'admins_found' => count($adminUsers)
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error fetching school admins: ' . $e->getMessage());
            $adminUsers = [];
        }

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
                'departments' => $school->departments_count,
                'admin_users' => $adminUsers,
            ],
        ]);
    }
}
