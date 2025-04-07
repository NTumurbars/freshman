<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class BuildingController extends Controller
{
    public function index(School $school)
    {
        $this->authorize('viewAny', Building::class);

        $buildings = $school->buildings()
            ->with('school')
            ->withCount('floors')
            ->withCount('rooms')
            ->get()
            ->map(function($building) {
                return [
                    'id' => $building->id,
                    'name' => $building->name,
                    'stats' => [
                        'floors' => $building->floors_count,
                        'rooms' => $building->rooms_count,
                    ],
                    'school_id' => $building->school_id,
                    'school_name' => $building->school->name
                ];
            });

        return Inertia::render('Buildings/Index', [
            'buildings' => $buildings,
            'school' => $school
        ]);
    }

    public function store(Request $request, School $school)
    {
        $this->authorize('create', Building::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $building = Building::create([
            ...$validated,
            'school_id' => $school->id
        ]);

        return redirect()
            ->route('buildings.floors.index', ['building' => $building->id, 'school' => $school->id])
            ->with('success', 'Building created successfully');
    }

    public function update(Request $request, School $school, Building $building)
    {
        $this->authorize('update', $building);

        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $building->update($validated);

        return redirect()
            ->back()
            ->with('success', 'Building updated successfully');
    }

    public function show(School $school, Building $building)
    {
        $this->authorize('view', $building);

        $building->load(['floors.rooms' => function($query) {
            $query->withCount(['schedules as occupied_slots' => function($query) {
                $query->whereDate('start_time', '>=', now());
            }]);
        }]);

        return Inertia::render('Buildings/Show', [
            'building' => [
                'id' => $building->id,
                'name' => $building->name,
                'school_id' => $building->school_id,
                'floors' => $building->floors->map(function($floor) {
                    return [
                        'id' => $floor->id,
                        'number' => $floor->number,
                        'rooms' => $floor->rooms->map(function($room) {
                            return [
                                'id' => $room->id,
                                'room_number' => $room->room_number,
                                'capacity' => $room->capacity,
                                'occupied_slots' => $room->occupied_slots
                            ];
                        })
                    ];
                })
            ],
            'school' => $school
        ]);
    }

    public function create(School $school)
    {
        $this->authorize('create', Building::class);

        return Inertia::render('Buildings/Create', [
            'school' => $school
        ]);
    }

    public function edit(School $school, Building $building)
    {
        $this->authorize('update', $building);

        return Inertia::render('Buildings/Edit', [
            'building' => $building,
            'school' => $school
        ]);
    }

    public function destroy(School $school, Building $building)
    {
        $this->authorize('delete', $building);
        $building->delete();
        return redirect(route('buildings.index', ['school' => $school->id]))->with('success', 'Building deleted successfully.');
    }
}
