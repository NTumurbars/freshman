<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Floor;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FloorController extends Controller
{
    public function index(School $school, Building $building)
    {
        $floors = $building->floors()->withCount('rooms')->with('rooms')->orderBy('number')->get();
        return Inertia::render('Buildings/Floors/Index', ['floors' => $floors, 'building' => $building]);
    }

    public function create(School $school, Building $building)
    {
        return Inertia::render('Buildings/Floors/Create', [
            'school' => $school,
            'building' => $building
        ]);
    }

    public function store(Request $request, School $school, Building $building)
    {
        $request->validate([
            'number' => 'required|integer',
        ]);

        $floor = Floor::create([
            'number' => $request->number,
            'building_id' => $building->id,
        ]);
        if ($floor) {
            return redirect(route('buildings.floors.index', ['building' => $building->id, 'school' => $school->id]))->with('success', 'Floor ' . $floor->number . ' added successfully');
        }
        return redirect(route('buildings.floors.index', ['building' => $building->id, 'school' => $school->id]))->with('fail', 'Failed to create the floor');
    }

    public function show(School $school, Building $building, Floor $floor)
    {
        $floor->load('rooms');
        return Inertia::render('Buildings/Floors/Show', [
            'floor' => $floor,
            'building' => $building,
            'school' => $school
        ]);
    }

    public function edit(School $school, Building $building, Floor $floor)
    {
        return Inertia::render('Buildings/Floors/Edit', [
            'floor' => $floor,
            'building' => $building,
            'school' => $school
        ]);
    }

    public function update(Request $request, School $school, Building $building, Floor $floor)
    {
        $request->validate([
            'number' => 'required|integer',
        ]);
        $floor->update([
            'number' => $request->number,
        ]);
        return redirect(route('buildings.floors.index', ['building' => $building->id, 'school' => $school->id]))->with('success', 'Floor ' . $floor->number . ' updated successfully');
    }

    public function destroy(School $school, Building $building, Floor $floor)
    {
        $floor->delete();
        return redirect(route('buildings.floors.index', ['building' => $building->id, 'school' => $school->id]))->with('success', 'Floor deleted successfully.');
    }
}
