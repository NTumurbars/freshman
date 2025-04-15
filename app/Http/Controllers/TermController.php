<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Term;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
// we need to add show method for this class
// GET|HEAD show schools/{school}/terms/{term}
class TermController extends Controller
{
    // GET /terms
    public function index()
    {
        $this->authorize('viewAny', Term::class);

        // Get the current user's school
        $user = Auth::user();
        $school = $user->school;

        // Ensure we're only getting terms for the current user's school
        if (!$school) {
            return Inertia::render('Terms/Index', [
                'terms' => [],
            ]);
        }

        $terms = Term::with(['school', 'sections.course', 'sections.professor_profile'])
            ->where('school_id', $school->id)
            ->withCount('sections')
            ->get()
            ->map(function ($term) {
                // Use today's date at start of day to ensure proper date comparisons
                $today = now()->startOfDay();
                return [
                    'id' => $term->id,
                    'school_id' => $term->school_id,
                    'name' => $term->name,
                    'school_name' => $term->school->name,
                    'start_date' => $term->start_date,
                    'end_date' => $term->end_date,
                    'sections_count' => $term->sections_count,
                    'is_current' => $today->between($term->start_date, $term->end_date),
                ];
            });

        // Don't override the entire auth data, just add the school if needed
        return Inertia::render('Terms/Index', [
            'terms' => $terms,
        ]);
    }

    // GET /schools/{school}/terms/create
    public function create(School $school)
    {
        $this->authorize('create', Term::class);

        return Inertia::render('Terms/Create', [
            'school' => [
                'id' => $school->id,
                'name' => $school->name,
            ],
        ]);
    }

    // POST /schools/{school}/terms
    public function store(Request $request, School $school)
    {
        $this->authorize('create', Term::class);

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('terms')->where(function ($query) use ($school) {
                    return $query->where('school_id', $school->id);
                }),
            ],
            'start_date' => ['required', 'date', 'after_or_equal:' . now()->format('Y-m-d')],
            'end_date' => ['required', 'date', 'after:start_date', 'before:' . now()->addYears(2)->format('Y-m-d')],
        ]);

        // Set the school_id from the route parameter
        $data['school_id'] = $school->id;

        $term = Term::create($data);

        // Update active term for the school
        Term::updateActiveTerm($school);

        // Add the school parameter to the redirect
        return redirect()
            ->route('terms.index', ['school' => $school->id])
            ->with('success', 'Term created successfully');
    }

    // GET /schools/{school}/terms/{term}/edit
    public function edit(School $school, $term)
    {
        $term = Term::with('school')->findOrFail($term);
        $this->authorize('update', $term);

        // Make sure the term belongs to the specified school
        if ($term->school_id !== $school->id) {
            abort(404);
        }

        return Inertia::render('Terms/Edit', [
            'term' => $term,
            'school' => [
                'id' => $school->id,
                'name' => $school->name,
            ],
        ]);
    }

    // PUT /schools/{school}/terms/{term}
    public function update(Request $request, School $school, $term)
    {
        $term = Term::findOrFail($term);
        $this->authorize('update', $term);

        // Make sure the term belongs to the specified school
        if ($term->school_id !== $school->id) {
            abort(404);
        }

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                Rule::unique('terms')
                    ->where(function ($query) use ($school, $term) {
                        return $query->where('school_id', $school->id);
                    })
                    ->ignore($term),
            ],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        // Ensure school_id remains the same
        $data['school_id'] = $school->id;

        $term->update($data);

        // Update active term for the school
        Term::updateActiveTerm($school);

        // Also fix the redirect here
        return redirect()
            ->route('terms.index', ['school' => $school->id])
            ->with('success', 'Term updated successfully');
    }

    // DELETE /schools/{school}/terms/{term}
    public function destroy(School $school, $term)
    {
        $term = Term::findOrFail($term);
        $this->authorize('delete', $term);

        // Make sure the term belongs to the specified school
        if ($term->school_id !== $school->id) {
            abort(404);
        }

        $term->delete();

        // Fix the redirect here too
        return redirect()
            ->route('terms.index', ['school' => $school->id])
            ->with('success', 'Term deleted successfully');
    }

    // GET schools/{school}/terms/{term}
    public function show(School $school, $term)
    {
        $term = Term::with(['sections.course', 'sections.professor_profile', 'sections.schedules.room'])->findOrFail($term);
        $user = Auth::user();

        if (in_array($user->role->id, [3, 4])) {
            $departmentId = $user->professor_profile->department_id;

            // Filter sections after loading
            $term->setRelation(
                'sections',
                $term->sections
                    ->filter(function ($section) use ($departmentId) {
                        return $section->course->department_id === $departmentId;
                    })
                    ->values(),
            );
        }
        $this->authorize('view', $term);

        if ($term->school_id !== $school->id) {
            abort(404);
        }

        return Inertia::render('Terms/Show', [
            'term' => [
                'id' => $term->id,
                'name' => $term->name,
                'start_date' => $term->start_date,
                'end_date' => $term->end_date,
                'sections' => $term->sections->map(function ($section) {
                    return [
                        'id' => $section->id,
                        'course_name' => $section->course->title,
                        'section_code' => $section->section_code,
                        'professor_name' => $section->professor_profile ? $section->professor_profile->user->name : 'Not assigned',
                        'number_of_students' => $section->number_of_students,
                        'schedules' => $section->schedules->map(function ($schedule) {
                            return [
                                'id' => $schedule->id,
                                'day_of_week' => $schedule->day_of_week,
                                'start_time' => $schedule->start_time,
                                'end_time' => $schedule->end_time,
                                'room_name' => $schedule->room->name,
                            ];
                        }),
                    ];
                }),
            ],
            'school' => $school,
        ]);
    }
}
