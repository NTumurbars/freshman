<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\RoomFeature;
use Illuminate\Http\Request;

class RoomFeatureController extends Controller
{
    // GET /room-features
    public function index()
    {
        $this->authorize('viewAny', RoomFeature::class);
        $features = RoomFeature::all();
        return Inertia::render('RoomFeatures/Index', ['features' => $features]);
    }

    // GET /room-features/create
    public function create()
    {
        $this->authorize('create', RoomFeature::class);
        return Inertia::render('RoomFeatures/Create');
    }

    // POST /room-features
    public function store(Request $request)
    {
        $this->authorize('create', RoomFeature::class);
        $data = $request->validate([
            'name'        => 'required|string|unique:room_features,name',
            'description' => 'nullable|string',
            'category'    => 'nullable|string',
        ]);

        // Set default category if not provided
        $data['category'] = $data['category'] ?? 'Other';

        RoomFeature::create($data);
        return redirect()->route('room-features.index')->with('success', 'Room feature created successfully');
    }

    // GET /room-features/{id}/edit
    public function edit(int $id)
    {
        $feature = RoomFeature::findOrFail($id);
        $this->authorize('update', $feature);
        return Inertia::render('RoomFeatures/Edit', ['feature' => $feature]);
    }

    // PUT /room-features/{id}
    public function update(Request $request, int $id)
    {
        $feature = RoomFeature::findOrFail($id);
        $this->authorize('update', $feature);
        $data = $request->validate([
            'name'        => 'required|string|unique:room_features,name,' . $feature->id,
            'description' => 'nullable|string',
            'category'    => 'nullable|string',
        ]);

        // Set default category if not provided
        $data['category'] = $data['category'] ?? 'Other';

        $feature->update($data);
        return redirect()->route('room-features.index')->with('success', 'Room feature updated successfully');
    }

    // DELETE /room-features/{id}
    public function destroy(int $id)
    {
        $feature = RoomFeature::findOrFail($id);
        $this->authorize('delete', $feature);
        $feature->delete();
        return redirect()->route('room-features.index')->with('success', 'Room feature deleted successfully');
    }

    // GET room-features/{room_feature}
    public function show(int $id)
    {
        $feature = RoomFeature::with(['rooms.floor.building', 'sections.course'])
            ->findOrFail($id);
        $this->authorize('view', $feature);

        return Inertia::render('RoomFeatures/Show', [
            'feature' => [
                'id' => $feature->id,
                'name' => $feature->name,
                'description' => $feature->description,
                'category' => $feature->category,
                'rooms' => $feature->rooms->map(function($room) {
                    return [
                        'id' => $room->id,
                        'room_number' => $room->room_number,
                        'building_name' => $room->floor->building->name,
                        'capacity' => $room->capacity
                    ];
                }),
                'sections' => $feature->sections->map(function($section) {
                    return [
                        'id' => $section->id,
                        'section_code' => $section->section_code,
                        'course_name' => $section->course->title,
                        'number_of_students' => $section->number_of_students
                    ];
                })
            ]
        ]);
    }
}
