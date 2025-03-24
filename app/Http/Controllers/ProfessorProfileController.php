<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\ProfessorProfile;
use App\Models\Department;
use Illuminate\Http\Request;

class ProfessorProfileController extends Controller
{
    // GET /professor-profiles
    public function index()
    {
        $profiles = ProfessorProfile::with(['user', 'department'])->get();
        return Inertia::render('ProfessorProfiles/Index', ['profiles' => $profiles]);
    }

    // GET /professor-profiles/create
    public function create()
    {
        $departments = Department::all();
        return Inertia::render('ProfessorProfiles/Create', ['departments' => $departments]);
    }

    // POST /professor-profiles
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'       => 'required|exists:users,id',
            'department_id' => 'required|exists:departments,id',
            'office_location' => 'nullable|string|max:255',
            'phone_number'  => 'nullable|string|max:50',
        ]);

        ProfessorProfile::create($data);
        return redirect()->route('professor-profiles.index')->with('success', 'Professor profile created successfully');
    }

    // GET /professor-profiles/{id}/edit
    public function edit($id)
    {
        $profile = ProfessorProfile::findOrFail($id);
        $departments = Department::all();
        return Inertia::render('ProfessorProfiles/Edit', [
            'profile' => $profile,
            'departments' => $departments,
        ]);
    }

    // PUT /professor-profiles/{id}
    public function update(Request $request, $id)
    {
        $profile = ProfessorProfile::findOrFail($id);
        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'office_location' => 'nullable|string|max:255',
            'phone_number'  => 'nullable|string|max:50',
        ]);

        $profile->update($data);
        return redirect()->route('professor-profiles.index')->with('success', 'Professor profile updated successfully');
    }

    // DELETE /professor-profiles/{id}
    public function destroy($id)
    {
        $profile = ProfessorProfile::findOrFail($id);
        $profile->delete();
        return redirect()->route('professor-profiles.index')->with('success', 'Professor profile deleted successfully');
    }
}
