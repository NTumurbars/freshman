<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\School;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    // GET /schools
    public function index()
    {
        return Inertia::render('Schools/Index', [
            'schools' => School::all()
        ]);
    }

    // GET /schools/create
    public function create()
    {
        return Inertia::render('Schools/Create');
    }

    // POST /schools
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|unique:schools,name',
            'email' => 'required|email',
        ]);

        School::create($validated);

        return redirect()
            ->route('schools.index')
            ->with('success', 'School created successfully.');
    }

    // GET /schools/{school}/edit
    public function edit(School $school)
    {
        return Inertia::render('Schools/Edit', [
            'school' => $school
        ]);
    }

    // PUT /schools/{school}
    public function update(Request $request, School $school)
    {
        $validated = $request->validate([
            'name'  => 'required|string|unique:schools,name,' . $school->id,
            'email' => 'required|email',
        ]);

        $school->update($validated);

        return redirect()
            ->route('schools.index')
            ->with('success', 'School updated successfully.');
    }

    // DELETE /schools/{school}
    public function destroy(School $school)
    {
        $school->delete();

        return redirect()
            ->route('schools.index')
            ->with('success', 'School deleted successfully.');
    }

    // GET schools/{school}
    public function show($id)
    {
        $school = School::withCount(['users', 'terms', 'rooms'])->findOrFail($id);
        return Inertia::render('Schools/Show', [
            'school' => [
                'id' => $school->id,
                'name' => $school->name,
                'email' => $school->email,
                'users' => $school->users_count,
                'terms' => $school->terms_count,
                'rooms' => $school->rooms_count,
            ]
        ]);
    }
}
