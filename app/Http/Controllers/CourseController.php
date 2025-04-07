<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Course;
use App\Models\Department;
use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CourseController extends Controller
{
    use AuthorizesRequests;

    // GET /courses
    public function index()
    {
        // Check if the user can view courses
        $this->authorize('viewAny', Course::class);

        $courses = Course::with(['department', 'major', 'sections'])->get();
        return Inertia::render('Courses/Index', ['courses' => $courses]);
    }

    // GET /courses/create
    public function create()
    {
        // Check if the user can create a course
        $this->authorize('create', Course::class);

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
        // Check if the user can create a course
        $this->authorize('create', Course::class);

        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'major_id'      => 'nullable|exists:majors,id',
            'course_code'   => 'required|string|unique:courses,course_code',
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'capacity'      => 'required|integer|min:0',
        ]);

        Course::create($data);
        return redirect()->route('courses.index', ['school' => $request->route('school')])->with('success', 'Course created successfully');
    }

    // GET /courses/{id}/edit
    public function edit($school, $id)
    {
        $course = Course::findOrFail($id);

        // Check if the user can update this course
        $this->authorize('update', $course);

        $departments = Department::all();
        $majors = Major::all();
        return Inertia::render('Courses/Edit', [
            'course' => $course,
            'departments' => $departments,
            'majors' => $majors,
        ]);
    }

    // PUT /courses/{id}
    public function update(Request $request, $school, $id)
    {
        $course = Course::findOrFail($id);

        // Check if the user can update this course
        $this->authorize('update', $course);

        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'major_id'      => 'nullable|exists:majors,id',
            'course_code'   => 'required|string|unique:courses,course_code,' . $course->id,
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'capacity'      => 'required|integer|min:0',
        ]);

        $course->update($data);
        return redirect()->route('courses.index', ['school' => $school])->with('success', 'Course updated successfully');
    }

    // DELETE /courses/{id}
    public function destroy($school, $id)
    {
        $course = Course::findOrFail($id);

        // Check if the user can delete this course
        $this->authorize('delete', $course);

        $course->delete();
        return redirect()->route('courses.index', ['school' => $school])->with('success', 'Course deleted successfully');
    }

    // GET /schools/{school}/courses/{course}
    public function show($id)
    {
        $course = Course::with(['departments', 'majors'])->findOrFail($id);
        return Inertia::render('Courses/Show', ['course' => $course]);
    }

}
