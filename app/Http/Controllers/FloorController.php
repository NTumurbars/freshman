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
        $floor->load(['rooms.schedules', 'rooms.features', 'building']);

        // Calculate utilization for the floor
        $timeBlocksPerDay = 12; // 12 hours of operation per day (8am-8pm)
        $daysPerWeek = 5; // Monday to Friday
        $maxPossibleSlotsPerRoom = $timeBlocksPerDay * $daysPerWeek;

        $totalRooms = 0;
        $totalUsedSlots = 0;
        $totalPossibleSlots = 0;
        $roomsWithUtilization = [];
        $processedRooms = [];

        // Process each room to calculate utilization
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
            $totalRooms++;
            $totalUsedSlots += $scheduledSlotsCount;
            $totalPossibleSlots += $maxPossibleSlotsPerRoom;

            // Add to list of rooms for sorting
            $roomsWithUtilization[] = [
                'id' => $room->id,
                'room_number' => $room->room_number,
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

        // Sort rooms by utilization for most/least utilized lists
        usort($roomsWithUtilization, function($a, $b) {
            return $b['utilization_percentage'] - $a['utilization_percentage'];
        });

        // Calculate floor utilization
        $floorUtilization = [
            'total_rooms' => $totalRooms,
            'used_slots' => $totalUsedSlots,
            'possible_slots' => $totalPossibleSlots,
            'utilization_percentage' => $totalPossibleSlots > 0
                ? round(($totalUsedSlots / $totalPossibleSlots) * 100, 1)
                : 0,
            'most_utilized_rooms' => array_slice($roomsWithUtilization, 0, 5),
            'least_utilized_rooms' => array_slice(array_reverse($roomsWithUtilization), 0, 5)
        ];

        return Inertia::render('Buildings/Floors/Show', [
            'floor' => $floor,
            'building' => $building,
            'school' => $school,
            'utilization' => $floorUtilization,
            'processed_rooms' => $processedRooms
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
