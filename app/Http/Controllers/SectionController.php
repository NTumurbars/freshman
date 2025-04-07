<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Section;
use App\Models\Course;
use App\Models\Term;
use App\Models\School;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
// We need to add the show method for this class
// GET|HEAD show schools/{school}/sections/{section}
class SectionController extends Controller
{
    // GET /schools/{school}/sections
    public function index(School $school)
    {
        $this->authorize('viewAny', Section::class);

        $user = Auth::user();

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $schoolCourseIds = Course::whereIn('department_id', $schoolDepartmentIds)->pluck('id');

        // Get sections for these courses
        $sections = Section::whereIn('course_id', $schoolCourseIds)
            ->with(['course.department', 'term', 'professor', 'schedules', 'requiredFeatures'])
            ->get();

        return Inertia::render('Sections/Index', [
            'sections' => $sections,
            'school' => $school
        ]);
    }

    // GET /schools/{school}/sections/create
    public function create(School $school)
    {
        $this->authorize('create', Section::class);

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $courses = Course::whereIn('department_id', $schoolDepartmentIds)->get();

        // Get terms for this school
        $terms = Term::where('school_id', $school->id)->get();

        return Inertia::render('Sections/Create', [
            'courses' => $courses,
            'terms' => $terms,
            'school' => $school
        ]);
    }

    // POST /schools/{school}/sections
    public function store(Request $request, School $school)
    {
        $this->authorize('create', Section::class);

        // Validate course belongs to this school
        $course = Course::findOrFail($request->course_id);
        $department = Department::findOrFail($course->department_id);

        if ($department->school_id !== $school->id) {
            return back()->withErrors(['course_id' => 'Selected course does not belong to this school']);
        }

        // Validate term belongs to this school
        $term = Term::findOrFail($request->term_id);
        if ($term->school_id !== $school->id) {
            return back()->withErrors(['term_id' => 'Selected term does not belong to this school']);
        }

        $data = $request->validate([
            'course_id'          => 'required|exists:courses,id',
            'term_id'            => 'required|exists:terms,id',
            'professor_id'       => 'nullable|exists:users,id',
            'section_code'       => 'required|string|max:10',
            'number_of_students' => 'required|integer|min:0',
        ]);

        $section = Section::create($data);

        if ($request->has('required_features')) {
            $section->requiredFeatures()->sync($request->required_features);
        }

        return redirect()->route('sections.index', ['school' => $school])->with('success', 'Section created successfully');
    }

    // GET /schools/{school}/sections/{section}
    public function show(School $school, $section)
    {
        $section = Section::with(['course.department', 'term', 'professor', 'schedules.room', 'requiredFeatures'])
            ->findOrFail($section);

        $this->authorize('view', $section);

        // Verify section belongs to this school
        $course = $section->course;
        if (!$course) {
            abort(404, 'Section not found');
        }

        $department = $course->department;
        if (!$department || $department->school_id !== $school->id) {
            abort(403, 'This section does not belong to your school');
        }

        return Inertia::render('Sections/Show', [
            'section' => $section,
            'school' => $school
        ]);
    }

    // GET /schools/{school}/sections/{section}/edit
    public function edit(School $school, $section)
    {
        $section = Section::findOrFail($section);
        $this->authorize('update', $section);

        // Verify section belongs to this school
        $course = $section->course;
        if (!$course) {
            abort(404, 'Section not found');
        }

        $department = $course->department;
        if (!$department || $department->school_id !== $school->id) {
            abort(403, 'This section does not belong to your school');
        }

        $section->load(['course', 'term', 'professor', 'schedules', 'requiredFeatures']);

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $courses = Course::whereIn('department_id', $schoolDepartmentIds)->get();

        // Get terms for this school
        $terms = Term::where('school_id', $school->id)->get();

        return Inertia::render('Sections/Edit', [
            'section' => $section,
            'courses' => $courses,
            'terms' => $terms,
            'school' => $school
        ]);
    }

    // PUT /schools/{school}/sections/{section}
    public function update(Request $request, School $school, $section)
    {
        $section = Section::findOrFail($section);
        $this->authorize('update', $section);

        // Verify section belongs to this school
        $currentCourse = $section->course;
        if (!$currentCourse) {
            abort(404, 'Section not found');
        }

        $currentDepartment = $currentCourse->department;
        if (!$currentDepartment || $currentDepartment->school_id !== $school->id) {
            abort(403, 'This section does not belong to your school');
        }

        // Validate new course belongs to this school
        if ($request->course_id != $section->course_id) {
            $newCourse = Course::findOrFail($request->course_id);
            $newDepartment = Department::findOrFail($newCourse->department_id);

            if ($newDepartment->school_id !== $school->id) {
                return back()->withErrors(['course_id' => 'Selected course does not belong to this school']);
            }
        }

        // Validate new term belongs to this school
        if ($request->term_id != $section->term_id) {
            $newTerm = Term::findOrFail($request->term_id);
            if ($newTerm->school_id !== $school->id) {
                return back()->withErrors(['term_id' => 'Selected term does not belong to this school']);
            }
        }

        $data = $request->validate([
            'course_id'          => 'required|exists:courses,id',
            'term_id'            => 'required|exists:terms,id',
            'professor_id'       => 'nullable|exists:users,id',
            'section_code'       => 'required|string|max:10',
            'number_of_students' => 'required|integer|min:0',
        ]);

        $section->update($data);

        if ($request->has('required_features')) {
            $section->requiredFeatures()->sync($request->required_features);
        }

        return redirect()->route('sections.index', ['school' => $school])->with('success', 'Section updated successfully');
    }

    // DELETE /schools/{school}/sections/{section}
    public function destroy(School $school, $section)
    {
        $section = Section::findOrFail($section);
        $this->authorize('delete', $section);

        // Verify section belongs to this school
        $course = $section->course;
        if (!$course) {
            abort(404, 'Section not found');
        }

        $department = $course->department;
        if (!$department || $department->school_id !== $school->id) {
            abort(403, 'This section does not belong to your school');
        }

        $section->delete();
        return redirect()->route('sections.index', ['school' => $school])->with('success', 'Section deleted successfully');
    }
}
