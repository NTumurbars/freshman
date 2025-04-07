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
        return Inertia::render('Schools/Index', [
            'schools' => School::all(),
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
        $validated = $request->validate([
            'name' => 'required|string|unique:schools,name',
            'email' => 'required|email',
        ]);

        School::create($validated);

        return redirect()->route('schools.index')->with('success', 'School created successfully.');
    }

    // GET /schools/{school}/edit
    public function edit(School $school)
    {
        $this->authorize('update', $school);
        return Inertia::render('Schools/Edit', [
            'school' => $school,
        ]);
    }

    // PUT /schools/{school}
    public function update(Request $request, School $school)
    {
        $this->authorize('update', $school);
        $validated = $request->validate([
            'name' => 'required|string|unique:schools,name,' . $school->id,
            'email' => 'required|email',
        ]);
        $school->update($validated);
        $userRole = Auth::user()->role_id;
        if ($userRole == 1) {
            return redirect()->route('schools.index')->with('success', 'School updated successfully.');
        } else {
            return redirect()
                ->route('dashboard')
                ->with('success', 'School updated successfully.');
        }
    }

    // DELETE /schools/{school}
    public function destroy(School $school)
    {
        $this->authorize('delete', $school);
        $school->delete();

        return redirect()->route('schools.index')->with('success', 'School deleted successfully.');
    }

    // GET schools/{school}
    public function show($id)
    {
        $school = School::withCount(['users', 'terms', 'buildings'])->findOrFail($id);
        return Inertia::render('Schools/Show', [
            'school_info' => [
                'id' => $school->id,
                'name' => $school->name,
                'email' => $school->email,
                'users' => $school->users_count,
                'terms' => $school->terms_count,
                'buildings' => $school->buildings_count,
            ],
        ]);
    }
}
