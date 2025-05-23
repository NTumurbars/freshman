<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\CourseRegistration;
use App\Models\Section;
use App\Models\User;
use Illuminate\Http\Request;

class CourseRegistrationController extends Controller
{
    // GET /course-registrations
    public function index()
    {
        $this->authorize('viewAny', CourseRegistration::class);
        $registrations = CourseRegistration::with(['section', 'student'])->get();
        return Inertia::render('CourseRegistrations/Index', ['registrations' => $registrations]);
    }

    // GET /course-registrations/create
    public function create()
    {
        $this->authorize('create', CourseRegistration::class);
        $sections = Section::all();
        $students = User::whereHas('role', function ($q) {
            $q->where('name', 'student');
        })->get();
        return Inertia::render('CourseRegistrations/Create', [
            'sections' => $sections,
            'students' => $students,
        ]);
    }

    // POST /course-registrations
    public function store(Request $request)
    {
        $this->authorize('create', CourseRegistration::class);
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'student_id' => 'required|exists:users,id',
        ]);

        CourseRegistration::create($data);
        return redirect()->route('course-registrations.index')->with('success', 'Registration created successfully');
    }

    // GET /course-registrations/{id}/edit
    public function edit($id)
    {
        $registration = CourseRegistration::findOrFail($id);
        $this->authorize('update', $registration);
        $sections = Section::all();
        $students = User::whereHas('role', function ($q) {
            $q->where('name', 'student');
        })->get();
        return Inertia::render('CourseRegistrations/Edit', [
            'registration' => $registration,
            'sections' => $sections,
            'students' => $students,
        ]);
    }

    // PUT /course-registrations/{id}
    public function update(Request $request, $id)
    {
        $registration = CourseRegistration::findOrFail($id);
        $this->authorize('update', $registration);
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'student_id' => 'required|exists:users,id',
        ]);

        $registration->update($data);
        return redirect()->route('course-registrations.index')->with('success', 'Registration updated successfully');
    }

    // DELETE /course-registrations/{id}
    public function destroy($id)
    {
        $registration = CourseRegistration::findOrFail($id);
        $this->authorize('delete', $registration);
        $registration->delete();
        return redirect()->route('course-registrations.index')->with('success', 'Registration deleted successfully');
    }
}
