<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Term;
use App\Models\School;
use Illuminate\Http\Request;
// we need to add show method for this class
// GET|HEAD show schools/{school}/terms/{term}
class TermController extends Controller
{
    // GET /terms
    public function index()
    {
        $terms = Term::with('school')->get();
        return Inertia::render('Terms/Index', ['terms' => $terms]);
    }

    // GET /terms/create
    public function create()
    {
        $schools = School::all();
        return Inertia::render('Terms/Create', ['schools' => $schools]);
    }

    // POST /terms
    public function store(Request $request)
    {
        $data = $request->validate([
            'school_id' => 'required|exists:schools,id',
            'name'      => 'required|string',
            'start_date'=> 'required|date',
            'end_date'  => 'required|date|after_or_equal:start_date',
        ]);

        Term::create($data);
        return redirect()->route('terms.index')->with('success', 'Term created successfully');
    }

    // GET /terms/{id}/edit
    public function edit($id)
    {
        $term = Term::findOrFail($id);
        $schools = School::all();
        return Inertia::render('Terms/Edit', [
            'term' => $term,
            'schools' => $schools,
        ]);
    }

    // PUT /terms/{id}
    public function update(Request $request, $id)
    {
        $term = Term::findOrFail($id);
        $data = $request->validate([
            'school_id' => 'required|exists:schools,id',
            'name'      => 'required|string',
            'start_date'=> 'required|date',
            'end_date'  => 'required|date|after_or_equal:start_date',
        ]);

        $term->update($data);
        return redirect()->route('terms.index')->with('success', 'Term updated successfully');
    }

    // DELETE /terms/{id}
    public function destroy($id)
    {
        $term = Term::findOrFail($id);
        $term->delete();
        return redirect()->route('terms.index')->with('success', 'Term deleted successfully');
    }
}
