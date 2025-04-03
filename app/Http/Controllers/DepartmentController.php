<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Department;
use App\Models\School;
use Illuminate\Http\Request;
class DepartmentController extends Controller
{
    // GET /departments
    public function index()
    {
        $this->authorize('viewAny', Department::class);
        $departments = Department::with(['school', 'majors', 'courses', 'professorProfiles'])->get();
        return Inertia::render('Departments/Index', ['departments' => $departments]);
    }

    // GET /departments/create
    public function create()
    {
        $this->authorize('create', Department::class);
        // Pass list of schools for selection
        $schools = School::all();
        return Inertia::render('Departments/Create', ['schools' => $schools]);
    }

    // POST /departments
    public function store(Request $request)
    {
        $this->authorize('create', Department::class);
        $data = $request->validate([
            'school_id' => 'required|exists:schools,id',
            'name'      => 'required|string',
        ]);

        Department::create($data);
        return redirect()->route('departments.index')->with('success', 'Department created successfully');
    }

    // GET /departments/{id}/edit
    public function edit($id)
    {
        $department = Department::findOrFail($id);
        $this->authorize('update', $department);
        $schools = School::all();
        return Inertia::render('Departments/Edit', [
            'department' => $department,
            'schools'    => $schools,
        ]);
    }

    // PUT /departments/{id}
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        $this->authorize('update', $department);
        $data = $request->validate([
            'school_id' => 'required|exists:schools,id',
            'name'      => 'required|string',
        ]);

        $department->update($data);
        return redirect()->route('departments.index')->with('success', 'Department updated successfully');
    }

    // DELETE /departments/{id}
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        $this->authorize('delete', $department);
        $department->delete();
        return redirect()->route('departments.index')->with('success', 'Department deleted successfully');
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
