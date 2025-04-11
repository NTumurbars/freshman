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
            'school' => $school,
            'can_create' => request()->user()->can('create', Building::class)
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
        }, 'floors.rooms.schedules']);

        // Calculate utilization for the entire building
        $timeBlocksPerDay = 12; // 12 hours of operation per day (8am-8pm)
        $daysPerWeek = 5; // Monday to Friday
        $maxPossibleSlotsPerRoom = $timeBlocksPerDay * $daysPerWeek;

        $totalRooms = 0;
        $totalUsedSlots = 0;
        $totalPossibleSlots = 0;
        $roomsWithUtilization = [];
        $processedFloors = [];

        // Process each floor and its rooms to calculate utilization
        foreach ($building->floors as $floor) {
            $floorRooms = 0;
            $floorUsedSlots = 0;
            $floorPossibleSlots = 0;
            $processedRooms = [];

            foreach ($floor->rooms as $room) {
                $scheduledSlotsCount = $room->schedules->count();
                $availableSlots = $maxPossibleSlotsPerRoom - $scheduledSlotsCount;

                $roomUtilization = [
                    'used_slots' => $scheduledSlotsCount,
                    'available_slots' => $availableSlots,
                    'total_slots' => $maxPossibleSlotsPerRoom,
                    'utilization_percentage' => $maxPossibleSlotsPerRoom > 0
                        ? round(($scheduledSlotsCount / $maxPossibleSlotsPerRoom) * 100, 1)
                        : 0
                ];

                // Add to floor totals
                $floorRooms++;
                $floorUsedSlots += $scheduledSlotsCount;
                $floorPossibleSlots += $maxPossibleSlotsPerRoom;

                // Add to building totals
                $totalRooms++;
                $totalUsedSlots += $scheduledSlotsCount;
                $totalPossibleSlots += $maxPossibleSlotsPerRoom;

                // Add to list of rooms for sorting
                $roomsWithUtilization[] = [
                    'id' => $room->id,
                    'room_number' => $room->room_number,
                    'floor_number' => $floor->number,
                    'capacity' => $room->capacity,
                    'used_slots' => $scheduledSlotsCount,
                    'available_slots' => $availableSlots,
                    'utilization_percentage' => $roomUtilization['utilization_percentage']
                ];

                // Create processed room with utilization data
                $processedRoom = $room->toArray();
                $processedRoom['utilization'] = $roomUtilization;
                $processedRooms[] = $processedRoom;
            }

            // Calculate floor utilization
            $floorUtilization = [
                'rooms_count' => $floorRooms,
                'used_slots' => $floorUsedSlots,
                'possible_slots' => $floorPossibleSlots,
                'utilization_percentage' => $floorPossibleSlots > 0
                    ? round(($floorUsedSlots / $floorPossibleSlots) * 100, 1)
                    : 0
            ];

            // Create processed floor with utilization data
            $processedFloor = $floor->toArray();
            $processedFloor['utilization'] = $floorUtilization;
            $processedFloor['rooms'] = $processedRooms;
            $processedFloors[] = $processedFloor;
        }

        // Sort rooms by utilization for most/least utilized lists
        usort($roomsWithUtilization, function($a, $b) {
            return $b['utilization_percentage'] - $a['utilization_percentage'];
        });

        // Calculate building utilization
        $buildingUtilization = [
            'total_rooms' => $totalRooms,
            'used_slots' => $totalUsedSlots,
            'possible_slots' => $totalPossibleSlots,
            'utilization_percentage' => $totalPossibleSlots > 0
                ? round(($totalUsedSlots / $totalPossibleSlots) * 100, 1)
                : 0,
            'most_utilized_rooms' => array_slice($roomsWithUtilization, 0, 5),
            'least_utilized_rooms' => array_slice(array_reverse($roomsWithUtilization), 0, 5)
        ];

        return Inertia::render('Buildings/Show', [
            'building' => [
                'id' => $building->id,
                'name' => $building->name,
                'school_id' => $building->school_id,
                'floors' => $processedFloors
            ],
            'utilization' => $buildingUtilization,
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
