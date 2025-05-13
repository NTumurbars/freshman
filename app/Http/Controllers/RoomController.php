<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Room;
use App\Models\School;
use App\Models\RoomFeature;
use App\Models\Floor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class RoomController extends Controller
{
    // GET /schools/{school}/rooms
    public function index(School $school)
    {
        $this->authorize('viewAny', Room::class);
        
        $rooms = Room::with(['features', 'floor.building.school', 'schedules.section.course', 'schedules.section.professor_profile.user'])
            ->whereHas('floor.building', function($query) use ($school) {
                $query->where('school_id', $school->id);
            })
            ->get();
            
        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms,
            'school' => $school
        ]);
    }

    // GET /schools/{school}/rooms/create
    public function create(Request $request, School $school, ?Floor $floor = null)
    {
        $this->authorize('create', Room::class);
        
        // Get floor_id from various sources
        $floorId = null;
        $preselectedFloor = null;
        $preselectedBuilding = null;
        
        // 1. Check if floor is directly provided through route model binding
        if ($floor) {
            $floorId = $floor->id;
            $preselectedFloor = $floor;
            $preselectedBuilding = $floor->building;
        } 
        // 2. Check if it's provided in request data
        else if ($request->has('floor_id')) {
            $floorId = $request->floor_id;
            $preselectedFloor = Floor::with('building')->find($floorId);
            if ($preselectedFloor && $preselectedFloor->building) {
                $preselectedBuilding = $preselectedFloor->building;
            }
        }
        
        $returnUrl = $request->input('return_url');
        $floors = Floor::with('building.school')->get();
        $features = RoomFeature::all();
        
        return Inertia::render('Rooms/Create', [
            'floors' => $floors,
            'features' => $features,
            'selectedFloorId' => $floorId ? (string)$floorId : null,
            'preselectedFloor' => $preselectedFloor,
            'preselectedBuilding' => $preselectedBuilding,
            'returnUrl' => $returnUrl
        ]);
    }

    // POST /rooms
    public function store(Request $request)
    {
        $this->authorize('create', Room::class);
        $data = $request->validate([
            'floor_id'    => 'required|exists:floors,id',
            'room_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('rooms')->where(function ($query) use ($request) {
                    return $query->where('floor_id', $request->floor_id);
                })
            ],
            'capacity'    => 'required|integer|min:0',
        ]);

        $room = Room::create($data);

        if ($request->has('feature_ids')) {
            $room->features()->sync($request->feature_ids);
        }

        // If return URL was provided, redirect there
        if ($request->has('return_url')) {
            return redirect()->to($request->return_url)->with('success', 'Room created successfully');
        }

        return redirect()->route('rooms.index')->with('success', 'Room created successfully');
    }

    // GET /rooms/{room}/edit
    public function edit(Request $request, School $school, Room $room)
    {
        $this->authorize('update', $room);
        
        // Load relationships
        $room->load(['features', 'floor.building.school']);
        $floors = Floor::with('building.school')->get();
        $features = RoomFeature::all();

        // Get the return URL if provided
        $returnUrl = $request->get('return_url');

        return Inertia::render('Rooms/Edit', [
            'room' => $room,
            'floors' => $floors,
            'features' => $features,
            'returnUrl' => $returnUrl,
            'school' => $school
        ]);
    }

    // PUT /rooms/{room}
    public function update(Request $request, School $school, Room $room)
    {
        $this->authorize('update', $room);
        $data = $request->validate([
            'floor_id'    => 'required|exists:floors,id',
            'room_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('rooms')->where(function ($query) use ($request) {
                    return $query->where('floor_id', $request->floor_id);
                })->ignore($room->id)
            ],
            'capacity'    => 'required|integer|min:0',
        ]);

        $room->update($data);
        if ($request->has('feature_ids')) {
            $room->features()->sync($request->feature_ids);
        }

        // If a return URL was provided, redirect there
        if ($request->has('return_url')) {
            return redirect()->to($request->return_url)->with('success', 'Room updated successfully');
        }

        return redirect()->route('rooms.index', ['school' => $school->id])->with('success', 'Room updated successfully');
    }

    // DELETE /rooms/{room}
    public function destroy(School $school, Room $room)
    {
        $this->authorize('delete', $room);
        $room->delete();
        return redirect()->route('rooms.index', ['school' => $school->id])->with('success', 'Room deleted successfully');
    }

    // GET schools/{school}/rooms/{room}
    public function show(School $school, Room $room)
    {
        $this->authorize('view', $room);
        $room->load(['features', 'schedules.section.course', 'schedules.section.professor_profile.user', 'floor.building.school']);
        
        return Inertia::render('Rooms/Show', [
            'room' => $room,
            'school' => $school
        ]);
    }

    // GET schools/{school}/buildings/{building}/floors/{floor}/rooms
    public function indexByFloor(School $school, $building, Floor $floor)
    {
        $this->authorize('viewAny', Room::class);
        
        // Get only rooms for this specific floor
        $rooms = $floor->rooms()->with([
            'features', 
            'schedules.section.course', 
            'schedules.section.professor_profile.user'
        ])->get();

        return Inertia::render('Buildings/Floors/Rooms/Index', [
            'rooms' => $rooms,
            'floor' => $floor,
            'building' => $floor->building,
            'school' => $school
        ]);
    }
}
