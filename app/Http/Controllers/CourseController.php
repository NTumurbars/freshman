<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Course;
use App\Models\Department;
use App\Models\Major;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CourseController extends Controller
{
    use AuthorizesRequests;

    // GET /courses
    public function index(School $school)
    {
        // Check if the user can view courses
        $this->authorize('viewAny', Course::class);

        // Filter courses based on departments that belong to the school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');
        $courses = Course::whereIn('department_id', $schoolDepartmentIds)
            ->with(['department', 'major', 'sections'])
            ->get();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'school' => $school
        ]);
    }

    // GET /courses/create
    public function create(School $school)
    {
        $this->authorize('create', Course::class);

        // Get only departments from the current school
        $departments = Department::where('school_id', $school->id)->get();

        // Get majors related to these departments
        $majors = Major::whereIn('department_id', $departments->pluck('id'))->get();

        return Inertia::render('Courses/Create', [
            'departments' => $departments,
            'majors' => $majors,
            'school' => $school
        ]);
    }

    // POST /courses
    public function store(Request $request, School $school)
    {
        // Check if the user can create a course
        $this->authorize('create', Course::class);

        // Verify the department belongs to the school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');
        if (!$schoolDepartmentIds->contains($request->department_id)) {
            return back()->withErrors(['department_id' => 'Selected department does not belong to your school']);
        }

        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'major_id'      => 'nullable|exists:majors,id',
            'code'          => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($school) {
                    // Check if this code is unique within this school
                    $exists = Course::whereHas('department', function ($query) use ($school) {
                        $query->where('school_id', $school->id);
                    })->where('code', $value)->exists();

                    if ($exists) {
                        $fail('The course code has already been taken within this school.');
                    }
                }
            ],
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'credits'       => 'required|integer|min:1|max:6',
        ]);

        Course::create($data);
        return redirect()->route('courses.index', ['school' => $school])->with('success', 'Course created successfully');
    }

    // GET /courses/{id}/edit
    public function edit(School $school, Course $course)
    {
        // Check if the user can update this course
        $this->authorize('update', $course);

        // Verify course belongs to the school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');
        if (!$schoolDepartmentIds->contains($course->department_id)) {
            abort(403, 'This course does not belong to your school');
        }

        // Get departments from this school
        $departments = Department::where('school_id', $school->id)->get();

        // Get majors related to these departments
        $majors = Major::whereIn('department_id', $departments->pluck('id'))->get();

        return Inertia::render('Courses/Edit', [
            'course' => $course,
            'departments' => $departments,
            'majors' => $majors,
            'school' => $school
        ]);
    }

    // PUT/PATCH /courses/{id}
    public function update(Request $request, School $school, Course $course)
    {
        // Check if the user can update this course
        $this->authorize('update', $course);

        // Verify course belongs to the school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');
        if (!$schoolDepartmentIds->contains($course->department_id)) {
            abort(403, 'This course does not belong to your school');
        }

        // Ensure the selected department belongs to the school
        if (!$schoolDepartmentIds->contains($request->department_id)) {
            return back()->withErrors(['department_id' => 'Selected department does not belong to your school']);
        }

        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'major_id'      => 'nullable|exists:majors,id',
            'code'          => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($school, $course) {
                    // Check if this code is unique within this school, excluding this course
                    $exists = Course::whereHas('department', function ($query) use ($school) {
                        $query->where('school_id', $school->id);
                    })
                    ->where('code', $value)
                    ->where('id', '!=', $course->id)
                    ->exists();

                    if ($exists) {
                        $fail('The course code has already been taken within this school.');
                    }
                }
            ],
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'credits'       => 'required|integer|min:1|max:6',
        ]);

        $course->update($data);
        return redirect()->route('courses.index', ['school' => $school])->with('success', 'Course updated successfully');
    }

    // DELETE /courses/{id}
    public function destroy(School $school, Course $course)
    {
        // Check if the user can delete this course
        $this->authorize('delete', $course);

        // Verify course belongs to the school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');
        if (!$schoolDepartmentIds->contains($course->department_id)) {
            abort(403, 'This course does not belong to your school');
        }

        $course->delete();
        return redirect()->route('courses.index', ['school' => $school])->with('success', 'Course deleted successfully');
    }

    // GET /schools/{school}/courses/{course}
    public function show(School $school, Course $course)
    {
        // Load relationships
        $course->load([
            'department',
            'major',
            'sections.term',
            'sections.schedules.room.floor.building',
            'sections.professor_profile.user',
            'sections.courseRegistrations'
        ]);

        // Make sure effective_capacity is calculated for each section
        $course->sections->each(function($section) {
            $section->append('effective_capacity');
        });

        // Check if the user can view this course
        $this->authorize('view', $course);

        // Verify course belongs to the school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');
        if (!$schoolDepartmentIds->contains($course->department_id)) {
            abort(403, 'This course does not belong to your school');
        }

        return Inertia::render('Courses/Show', [
            'course' => $course,
            'school' => $school
        ]);
    }

}
