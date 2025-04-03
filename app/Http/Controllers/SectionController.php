<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Section;
use App\Models\Course;
use App\Models\Term;
use Illuminate\Http\Request;
// We need to add the show method for this class
// GET|HEAD show schools/{school}/sections/{section} 
class SectionController extends Controller
{
    // GET /sections
    public function index()
    {
        $this->authorize('viewAny', Section::class);
        $sections = Section::with(['course', 'term', 'professor', 'schedules', 'requiredFeatures'])->get();
        return Inertia::render('Sections/Index', ['sections' => $sections]);
    }

    // GET /sections/create
    public function create()
    {
        $this->authorize('create', Section::class);
        $courses = Course::all();
        $terms = Term::all();
        return Inertia::render('Sections/Create', [
            'courses' => $courses,
            'terms' => $terms,
        ]);
    }

    // POST /sections
    public function store(Request $request)
    {
        $this->authorize('create', Section::class);
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

        return redirect()->route('sections.index')->with('success', 'Section created successfully');
    }

    // GET /sections/{id}/edit
    public function edit($id)
    {
        $section = Section::findOrFail($id);
        $this->authorize('update', $section);
        $section = Section::with(['course', 'term', 'professor', 'schedules', 'requiredFeatures'])->findOrFail($id);
        $courses = Course::all();
        $terms = Term::all();
        return Inertia::render('Sections/Edit', [
            'section' => $section,
            'courses' => $courses,
            'terms' => $terms,
        ]);
    }

    // PUT /sections/{id}
    public function update(Request $request, $id)
    {
        $section = Section::findOrFail($id);
        $this->authorize('update', $section);
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

        return redirect()->route('sections.index')->with('success', 'Section updated successfully');
    }

    // DELETE /sections/{id}
    public function destroy($id)
    {
        $section = Section::findOrFail($id);
        $this->authorize('delete', $section);
        $section->delete();
        return redirect()->route('sections.index')->with('success', 'Section deleted successfully');
    }
}
