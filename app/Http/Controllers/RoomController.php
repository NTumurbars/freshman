<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\School;
use App\Models\RoomFeature;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    // GET /rooms
    public function index(Floor $floor)
    {
        $this->authorize('viewAny', Room::class);
        $rooms = $floor->rooms()->with('features')->get();
        return Inertia::render('Buildings/Floors/Rooms/Index', ['rooms' => $rooms, 'floor' => $floor]);
    }

    // POST /rooms
    public function store(Floor $floor, Request $request)
    {
        $this->authorize('create', Room::class);
        $request->validate([
            'room_number' => 'required|string|max:50',
            'capacity'    => 'required|integer|min:0',
        ],[
            'room_number.required' => 'Some code or number please',
            'capacity.required' => 'No capacity 0_0',
        ]);

        $room = Room::create([
            'room_number' => $request->room_number,
            'capacity' => $request->capacity,
            'floor_id' => $floor->id,
        ]);

        if ($request->has('feature_ids')) {
            $room->features()->sync($request->feature_ids);
        }
        return redirect()->route('floors.rooms.index', $floor->id)->with('success', 'Room created successfully');
    }

    // GET /rooms/{id}/edit
    public function edit($id)
    {
        $room = Room::findOrFail($id);
        $this->authorize('update', $room);
        $room = Room::with('features')->findOrFail($id);
        $schools = School::all();
        $features = RoomFeature::all();
        return Inertia::render('Rooms/Edit', [
            'room' => $room,
            'schools' => $schools,
            'features' => $features,
        ]);
    }

    // PUT /rooms/{id}
    public function update(Floor $floor, Room $room, Request $request)
    {
        $this->authorize('update', $room);
        $data = $request->validate([
            'room_number' => 'required|string|max:50',
            'capacity'    => 'required|integer|min:0',
        ],[
            'room_number.required' => 'Some code or number please',
            'capacity.required' => 'No capacity 0_0',
        ]);

        $room->update($data);
        if ($request->has('feature_ids')) {
            $room->features()->sync($request->feature_ids);
        }
        return redirect()->route('floors.rooms.index', $floor->id)->with('success', 'Room updated successfully');
    }

    // DELETE /rooms/{id}
    public function destroy(Floor $floor, Room $room)
    {
        $this->authorize('delete', $room);
        $room->delete();
        return redirect()->route('floors.rooms.index', $floor->id)->with('success', 'Room deleted successfully');
    }

    // GET schools/{school}/rooms/{room}
    public function show($id)
    {
        $room = Room::with(['features', 'schedules'])->findOrFail($id);
        return Inertia::render('Rooms/Show', [
            'room' => $room
        ]);
    }
}
