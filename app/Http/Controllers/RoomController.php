<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Room;
use App\Models\School;
use App\Models\RoomFeature;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    // GET /rooms
    public function index()
    {
        $rooms = Room::with('features')->get();
        return Inertia::render('Rooms/Index', ['rooms' => $rooms]);
    }

    // GET /rooms/create
    public function create()
    {
        $schools = School::all();
        $features = RoomFeature::all();
        return Inertia::render('Rooms/Create', [
            'schools' => $schools,
            'features' => $features,
        ]);
    }

    // POST /rooms
    public function store(Request $request)
    {
        $data = $request->validate([
            'school_id'   => 'required|exists:schools,id',
            'room_number' => 'required|string|max:50',
            'building'    => 'nullable|string|max:100',
            'capacity'    => 'required|integer|min:0',
        ]);

        $room = Room::create($data);

        if ($request->has('feature_ids')) {
            $room->features()->sync($request->feature_ids);
        }
        return redirect()->route('rooms.index')->with('success', 'Room created successfully');
    }

    // GET /rooms/{id}/edit
    public function edit($id)
    {
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
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);
        $data = $request->validate([
            'room_number' => 'required|string|max:50',
            'building'    => 'nullable|string|max:100',
            'capacity'    => 'required|integer|min:0',
        ]);

        $room->update($data);
        if ($request->has('feature_ids')) {
            $room->features()->sync($request->feature_ids);
        }
        return redirect()->route('rooms.index')->with('success', 'Room updated successfully');
    }

    // DELETE /rooms/{id}
    public function destroy($id)
    {
        $room = Room::findOrFail($id);
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
}
