<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Course;
use App\Models\Department;
use App\Models\Major;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // GET /courses
    public function index()
    {
        $courses = Course::with(['department', 'major', 'sections'])->get();
        return Inertia::render('Courses/Index', ['courses' => $courses]);
    }

    // GET /courses/create
    public function create()
    {
        $departments = Department::all();
        $majors = Major::all();
        return Inertia::render('Courses/Create', [
            'departments' => $departments,
            'majors' => $majors,
        ]);
    }

    // POST /courses
    public function store(Request $request)
    {
        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'major_id'      => 'nullable|exists:majors,id',
            'course_code'   => 'required|string|unique:courses,course_code',
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'capacity'      => 'required|integer|min:0',
        ]);

        Course::create($data);
        return redirect()->route('courses.index')->with('success', 'Course created successfully');
    }

    // GET /courses/{id}/edit
    public function edit($id)
    {
        $course = Course::findOrFail($id);
        $departments = Department::all();
        $majors = Major::all();
        return Inertia::render('Courses/Edit', [
            'course' => $course,
            'departments' => $departments,
            'majors' => $majors,
        ]);
    }

    // PUT /courses/{id}
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'major_id'      => 'nullable|exists:majors,id',
            'course_code'   => 'required|string|unique:courses,course_code,' . $course->id,
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'capacity'      => 'required|integer|min:0',
        ]);

        $course->update($data);
        return redirect()->route('courses.index')->with('success', 'Course updated successfully');
    }

    // DELETE /courses/{id}
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();
        return redirect()->route('courses.index')->with('success', 'Course deleted successfully');
    }
}
