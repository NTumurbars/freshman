<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Major;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Models\School;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class MajorController extends Controller
{
    // GET /majors
    public function index(School $school)
    {
        $this->authorize('viewAny', Major::class);
        
        // Get departments in this school
        $departmentIds = Department::where('school_id', $school->id)->pluck('id');
        
        // Get majors for these departments
        $majors = Major::whereIn('department_id', $departmentIds)
            ->with('department')
            ->get()
            ->map(function ($major) {
                // Add a temporary student count
                $major->student_count = 0;
                return $major;
            });
            
        return Inertia::render('Majors/Index', [
            'majors' => $majors,
            'school' => $school,
            'can_create' => Gate::allows('create', Major::class)
        ]);
    }

    // GET /majors/create
    public function create(School $school)
    {
        $this->authorize('create', Major::class);
        
        // Get departments in this school
        $departments = Department::where('school_id', $school->id)->get();
        
        return Inertia::render('Majors/Create', [
            'departments' => $departments,
            'school' => $school
        ]);
    }

    // POST /majors
    public function store(Request $request, School $school)
    {
        $this->authorize('create', Major::class);
        
        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|string|unique:majors,code',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string'
        ]);

        // Verify department belongs to this school
        $department = Department::findOrFail($data['department_id']);
        if ($department->school_id !== $school->id) {
            return back()->withErrors(['department_id' => 'Selected department does not belong to this school']);
        }

        $major = Major::create($data);
        
        return redirect()
            ->route('majors.index', ['school' => $school->id])
            ->with('success', 'Major created successfully');
    }

    // GET /majors/{id}/edit
    public function edit(School $school, $id)
    {
        $major = Major::findOrFail($id);
        $this->authorize('update', $major);
        
        // Verify major's department belongs to this school
        $department = Department::findOrFail($major->department_id);
        if ($department->school_id !== $school->id) {
            abort(404, 'Major not found in this school');
        }
        
        // Get departments in this school
        $departments = Department::where('school_id', $school->id)->get();
        
        return Inertia::render('Majors/Edit', [
            'major' => $major,
            'departments' => $departments,
            'school' => $school
        ]);
    }

    // PUT /majors/{id}
    public function update(Request $request, School $school, $id)
    {
        $major = Major::findOrFail($id);
        $this->authorize('update', $major);
        
        // Verify major's department belongs to this school
        $currentDepartment = Department::findOrFail($major->department_id);
        if ($currentDepartment->school_id !== $school->id) {
            abort(404, 'Major not found in this school');
        }
        
        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|string|unique:majors,code,' . $major->id,
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string'
        ]);

        // Verify new department belongs to this school
        if ($data['department_id'] != $major->department_id) {
            $newDepartment = Department::findOrFail($data['department_id']);
            if ($newDepartment->school_id !== $school->id) {
                return back()->withErrors(['department_id' => 'Selected department does not belong to this school']);
            }
        }

        $major->update($data);
        
        return redirect()
            ->route('majors.index', ['school' => $school->id])
            ->with('success', 'Major updated successfully');
    }

    // DELETE /majors/{id}
    public function destroy(School $school, $id)
    {
        $major = Major::findOrFail($id);
        $this->authorize('delete', $major);
        
        // Verify major's department belongs to this school
        $department = Department::findOrFail($major->department_id);
        if ($department->school_id !== $school->id) {
            abort(404, 'Major not found in this school');
        }
        
        $major->delete();
        
        return redirect()
            ->route('majors.index', ['school' => $school->id])
            ->with('success', 'Major deleted successfully');
    }

    // GET /majors/{id}
    public function show(School $school, $id)
    {
        $major = Major::with(['department', 'courses'])->findOrFail($id);
        $this->authorize('view', $major);
        
        // Verify major's department belongs to this school
        $department = Department::findOrFail($major->department_id);
        if ($department->school_id !== $school->id) {
            abort(404, 'Major not found in this school');
        }
        
        return Inertia::render('Majors/Show', [
            'major' => $major,
            'school' => $school
        ]);
    }
}
