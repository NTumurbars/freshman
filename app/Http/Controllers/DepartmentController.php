<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Department;
use App\Models\School;
use App\Models\ProfessorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class DepartmentController extends Controller
{
    // GET /departments
    public function index(School $school)
    {
        $this->authorize('viewAny', Department::class);

        // Verify user has access to this school
        $user = Auth::user();
        if ($user->role->id !== 2 && $user->school_id !== $school->id) {
            abort(403, 'You do not have access to this school');
        }

        $departments = Department::where('school_id', $school->id)
            ->with(['school', 'majors', 'courses', 'professorProfiles'])
            ->withCount(['majors', 'courses', 'professorProfiles'])
            ->orderBy('name')
            ->get()
            ->map(function ($department) {
                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'school_id' => $department->school_id,
                    'code' => $department->code,
                    'stats' => [
                        'majors' => $department->majors_count,
                        'courses' => $department->courses_count,
                        'professors' => $department->professor_profiles_count,
                    ]
                ];
            });
        return Inertia::render('Departments/Index', [
            'departments' => $departments,
            'school' => $school,
            'can_create' => Gate::allows('create', Department::class)
        ]);
    }

    // GET /departments/{id}
    public function show(School $school, $id)
    {
        $department = Department::findOrFail($id);
        
        $this->authorize('view', $department);

        // Verify department belongs to the school
        if ($department->school_id !== $school->id) {
            abort(404, 'Department not found in this school');
        }
        
        // Load relationships manually to ensure they work correctly
        $department->load(['majors', 'courses']);
        
        // Explicitly load the professor profiles with their users
        $professorProfiles = ProfessorProfile::where('department_id', $department->id)
            ->with('user')
            ->get();
        
        // Assign the profiles to the department
        $department->professorProfiles = $professorProfiles;

        return Inertia::render('Departments/Show', [
            'department' => $department,
            'school' => $school
        ]);
    }

    // GET /departments/create
    public function create(School $school)
    {
        $this->authorize('create', Department::class);

        // Verify user has access to this school
        $user = Auth::user();
        if ($user->role->name !== 'super_admin' && $user->school_id !== $school->id) {
            abort(403, 'You do not have access to this school');
        }

        return Inertia::render('Departments/Create', [
            'school_id' => $school->id,
            'school' => $school
        ]);
    }

    // POST /departments
    public function store(Request $request, School $school)
    {
        $this->authorize('create', Department::class);

        // Verify user has access to this school
        $user = Auth::user();
        if ($user->role->name !== 'super_admin' && $user->school_id !== $school->id) {
            abort(403, 'You do not have access to this school');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:10',
            'contact.email' => 'nullable|email|max:255',
            'contact.phone' => 'nullable|string|max:20',
            'contact.office' => 'nullable|string|max:255',
        ]);

        $department = Department::create([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'school_id' => $school->id,
            'contact' => [
                'email' => $validated['contact']['email'] ?? null,
                'phone' => $validated['contact']['phone'] ?? null,
                'office' => $validated['contact']['office'] ?? null,
            ]
        ]);

        return redirect()
            ->route('departments.index', ['school' => $school])
            ->with('success', 'Department created successfully');
    }

    // GET /departments/{id}/edit
    public function edit(School $school, $id)
    {
        $department = Department::findOrFail($id);
        $this->authorize('update', $department);

        // Verify department belongs to the school
        if ($department->school_id !== $school->id) {
            abort(404, 'Department not found in this school');
        }

        return Inertia::render('Departments/Edit', [
            'department' => $department,
            'school_id' => $school->id,
            'school' => $school
        ]);
    }

    // PUT /departments/{id}
    public function update(Request $request, School $school, Department $department)
    {
        $this->authorize('update', $department);

        // Verify department belongs to the school
        if ($department->school_id !== $school->id) {
            abort(404, 'Department not found in this school');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:10',
            'contact.email' => 'nullable|email|max:255',
            'contact.phone' => 'nullable|string|max:20',
            'contact.office' => 'nullable|string|max:255',
        ]);


        $department->update([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? $department->code,
            'contact' => [
                'email' => $validated['contact']['email'] ?? null,
                'phone' => $validated['contact']['phone'] ?? null,
                'office' => $validated['contact']['office'] ?? null,
            ]
        ]);
        return redirect(route('departments.show', [$school->id, $department->id]))
            ->with('success', 'Department updated successfully');
    }

    // DELETE /departments/{id}
    public function destroy(School $school, Department $department)
    {
        $this->authorize('delete', $department);

        // Verify department belongs to the school
        if ($department->school_id !== $school->id) {
            abort(404, 'Department not found in this school');
        }

        $department->delete();
        return redirect()->route('departments.index', ['school' => $school])->with('success', 'Department deleted successfully');
    }
}
