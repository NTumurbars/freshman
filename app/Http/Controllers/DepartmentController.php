<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Department;
use App\Models\School;
use Illuminate\Http\Request;
class DepartmentController extends Controller
{
    // GET /departments
    public function index($school)
    {
        $this->authorize('viewAny', Department::class);
        $departments = Department::where('school_id', $school)->with(['school', 'majors', 'courses', 'professorProfiles'])->get();
        return Inertia::render('Departments/Index', ['departments' => $departments, 'school_id' => $school]);
    }

    // GET /departments/{id}
    public function show($school, $id)
    {
        $department = Department::with(['majors', 'courses'])->findOrFail($id);
        $this->authorize('view', $department);
        return Inertia::render('Departments/Show', ['department' => $department]);
    }

    // GET /departments/create
    public function create($school)
    {
        $this->authorize('create', Department::class);
        // Pass list of schools for selection
        // $schools = School::all();
        return Inertia::render('Departments/Create', ['school_id' => $school]);
    }

    // POST /departments
    public function store(Request $request, $school)
    {
        $this->authorize('create', Department::class);
        $data = $request->validate([
            'name'      => 'required|string',
        ]);

        Department::create(['name' => $data['name'], 'school_id' => $school]);
        return redirect()->route('departments.index', ['school' => $school])->with('success', 'Department created successfully');
    }

    // GET /departments/{id}/edit
    public function edit($school, $id)
    {
        $department = Department::findOrFail($id);
        $this->authorize('update', $department);
        return Inertia::render('Departments/Edit', [
            'department' => $department,
            'school_id'  => $school,
        ]);
    }

    // PUT /departments/{id}
    public function update(Request $request, $school, $id)
    {
        $department = Department::findOrFail($id);
        $this->authorize('update', $department);
        $data = $request->validate([
            // 'school_id' => 'required|exists:schools,id',
            'name'      => 'required|string',
        ]);

        $department->update($data);
        return redirect()->route('departments.index', ['school' => $school])->with('success', 'Department updated successfully');
    }

    // DELETE /departments/{id}
    public function destroy($school, $id)
    {
        $department = Department::findOrFail($id);
        $this->authorize('delete', $department);
        $department->delete();
        return redirect()->route('departments.index', ['school' => $school])->with('success', 'Department deleted successfully');
    }

    // GET  schools/{school}/departments/{department} 
    public function show($id)
    {
        $department = Department::with(['majors', 'professorProfiles', 'courses'])->findOrFail($id);

        return Inertia::render('Departments/Show', [
            'department' => $department,
        ]);
    }
}
