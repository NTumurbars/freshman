<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BuildingController extends Controller
{
    public function index(School $school)
    {
        $buildings = $school->buildings;
        return Inertia::render('Buildings/Index', ['buildings' => $buildings]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'name' => 'required|max:255',
        ]);

        $building = Building::create([
            'name' => $request->name,
            'school_id' => $school->id,
        ]);

        if ($building) {
            return redirect(route('buildings.floor.index', ['building' => $building->id, 'school' => $school->id]))->with('success', 'Building ' . $building->name . ' added successfully');
        }
        return redirect(route('buildings.index', ['school' => $school->id]))->with('fail', 'Failed to create the building');
    }

    public function update(Request $request, School $school, Building $building)
    {
        $request->validate([
            'name' => 'required|max:255',
        ]);
        $building->update([
            'name' => $request->name,
        ]);
        return redirect(route('buildings.index', ['school' => $school->id]))->with('success', 'Building ' . $building->name . ' added successfully');
    }

    public function destroy(School $school, Building $building)
    {
        $building->delete();
        return redirect(route('buildings.index', ['school' => $school->id]))->with('success', 'School deleted successfully.');
    }
}
