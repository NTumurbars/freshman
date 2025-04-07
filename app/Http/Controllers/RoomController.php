<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Room;
use App\Models\School;
use App\Models\RoomFeature;
use App\Models\Floor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    // GET /rooms
    public function index()
    {
        $this->authorize('viewAny', Room::class);
        $rooms = Room::with(['features', 'floor.building.school', 'schedules'])->get();
        return Inertia::render('Rooms/Index', ['rooms' => $rooms]);
    }

    // GET /rooms/create
    public function create(Request $request)
    {
        $this->authorize('create', Room::class);

        $selectedFloorId = $request->get('floor_id');
        $returnUrl = $request->get('return_url');

        $floors = Floor::with('building.school')->get();
        $features = RoomFeature::all();

        return Inertia::render('Rooms/Create', [
            'floors' => $floors,
            'features' => $features,
            'selectedFloorId' => $selectedFloorId,
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
            return redirect($request->return_url)->with('success', 'Room created successfully');
        }

        return redirect()->route('rooms.index')->with('success', 'Room created successfully');
    }

    // GET /rooms/{id}/edit
    public function edit(Request $request, $id)
    {
        $room = Room::with(['features', 'floor.building.school'])->findOrFail($id);
        $this->authorize('update', $room);
        $floors = Floor::with('building.school')->get();
        $features = RoomFeature::all();

        // Get the return URL if provided
        $returnUrl = $request->get('return_url');

        return Inertia::render('Rooms/Edit', [
            'room' => $room,
            'floors' => $floors,
            'features' => $features,
            'returnUrl' => $returnUrl
        ]);
    }

    // PUT /rooms/{id}
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);
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
            return redirect($request->return_url)->with('success', 'Room updated successfully');
        }

        return redirect()->route('rooms.index')->with('success', 'Room updated successfully');
    }

    // DELETE /rooms/{id}
    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        $this->authorize('delete', $room);
        $room->delete();
        return redirect()->route('rooms.index')->with('success', 'Room deleted successfully');
    }

    // GET schools/{school}/rooms/{room}
    public function show($id)
    {
        $room = Room::with(['features', 'schedules'])->findOrFail($id);
        return Inertia::render('Rooms/Show', [
            'room' => $room
        ]);
    }

    // GET schools/{school}/buildings/{building}/floors/{floor}/rooms
    public function indexByFloor(School $school, $building, Floor $floor)
    {
        $this->authorize('viewAny', Room::class);
        $rooms = $floor->rooms()->with(['features', 'schedules'])->get();

        return Inertia::render('Buildings/Floors/Rooms/Index', [
            'rooms' => $rooms,
            'floor' => $floor,
            'building' => $floor->building,
            'school' => $school
        ]);
    }
}
