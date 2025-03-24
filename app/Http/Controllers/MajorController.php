<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Major;
use App\Models\Department;
use Illuminate\Http\Request;

class MajorController extends Controller
{
    // GET /majors
    public function index()
    {
        $majors = Major::with('department')->get();
        return Inertia::render('Majors/Index', ['majors' => $majors]);
    }

    // GET /majors/create
    public function create()
    {
        $departments = Department::all();
        return Inertia::render('Majors/Create', ['departments' => $departments]);
    }

    // POST /majors
    public function store(Request $request)
    {
        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'code'          => 'required|string|unique:majors,code',
        ]);

        Major::create($data);
        return redirect()->route('majors.index')->with('success', 'Major created successfully');
    }

    // GET /majors/{id}/edit
    public function edit($id)
    {
        $major = Major::findOrFail($id);
        $departments = Department::all();
        return Inertia::render('Majors/Edit', [
            'major' => $major,
            'departments' => $departments,
        ]);
    }

    // PUT /majors/{id}
    public function update(Request $request, $id)
    {
        $major = Major::findOrFail($id);
        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'code'          => 'required|string|unique:majors,code,' . $major->id,
        ]);

        $major->update($data);
        return redirect()->route('majors.index')->with('success', 'Major updated successfully');
    }

    // DELETE /majors/{id}
    public function destroy($id)
    {
        $major = Major::findOrFail($id);
        $major->delete();
        return redirect()->route('majors.index')->with('success', 'Major deleted successfully');
    }
}
