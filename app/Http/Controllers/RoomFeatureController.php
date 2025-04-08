<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\RoomFeature;
use App\Models\School;
use Illuminate\Http\Request;

class RoomFeatureController extends Controller
{
    // GET /schools/{school}/roomfeatures
    public function index(School $school)
    {
        $this->authorize('viewAny', RoomFeature::class);
        
        $features = RoomFeature::withCount('rooms')->get();
        
        return Inertia::render('RoomFeatures/Index', [
            'features' => $features,
            'school' => $school,
            'can_create' => request()->user()->can('create', RoomFeature::class)
        ]);
    }

    // GET /schools/{school}/roomfeatures/create
    public function create(School $school)
    {
        $this->authorize('create', RoomFeature::class);
        
        return Inertia::render('RoomFeatures/Create', [
            'school' => $school,
            'categories' => $this->getCategories()
        ]);
    }

    // POST /schools/{school}/roomfeatures
    public function store(Request $request, School $school)
    {
        $this->authorize('create', RoomFeature::class);
        
        $data = $request->validate([
            'name'        => 'required|string|unique:room_features,name',
            'description' => 'nullable|string',
            'category'    => 'required|string',
        ]);

        RoomFeature::create($data);
        
        return redirect()->route('roomfeatures.index', $school->id)
            ->with('message', 'Room feature created successfully')
            ->with('type', 'success');
    }

    // GET /schools/{school}/roomfeatures/{roomfeature}/edit
    public function edit(School $school, RoomFeature $roomfeature)
    {
        $this->authorize('update', $roomfeature);
        
        return Inertia::render('RoomFeatures/Edit', [
            'roomfeature' => $roomfeature,
            'school' => $school,
            'categories' => $this->getCategories()
        ]);
    }

    // PUT /schools/{school}/roomfeatures/{roomfeature}
    public function update(Request $request, School $school, RoomFeature $roomfeature)
    {
        $this->authorize('update', $roomfeature);
        
        $data = $request->validate([
            'name'        => 'required|string|unique:room_features,name,' . $roomfeature->id,
            'description' => 'nullable|string',
            'category'    => 'required|string',
        ]);

        $roomfeature->update($data);
        
        return redirect()->route('roomfeatures.index', $school->id)
            ->with('message', 'Room feature updated successfully')
            ->with('type', 'success');
    }

    // DELETE /schools/{school}/roomfeatures/{roomfeature}
    public function destroy(School $school, RoomFeature $roomfeature)
    {
        $this->authorize('delete', $roomfeature);
        
        // Check if the feature is in use
        if ($roomfeature->rooms()->count() > 0) {
            return redirect()->route('roomfeatures.index', $school->id)
                ->with('message', 'Cannot delete feature that is in use by rooms')
                ->with('type', 'error');
        }
        
        $roomfeature->delete();
        
        return redirect()->route('roomfeatures.index', $school->id)
            ->with('message', 'Room feature deleted successfully')
            ->with('type', 'success');
    }

    // GET /schools/{school}/roomfeatures/{roomfeature}
    public function show(School $school, RoomFeature $roomfeature)
    {
        $this->authorize('view', $roomfeature);

        $roomfeature->load(['rooms.floor.building']);
        
        return Inertia::render('RoomFeatures/Show', [
            'roomfeature' => [
                'id' => $roomfeature->id,
                'name' => $roomfeature->name,
                'description' => $roomfeature->description,
                'category' => $roomfeature->category,
                'rooms' => $roomfeature->rooms->map(function($room) {
                    return [
                        'id' => $room->id,
                        'room_number' => $room->room_number,
                        'building_name' => $room->floor->building->name,
                        'capacity' => $room->capacity
                    ];
                }),
            ],
            'school' => $school
        ]);
    }

    /**
     * Get the predefined list of categories
     * 
     * @return array
     */
    private function getCategories()
    {
        return [
            'Technology' => 'Technology',
            'Furniture' => 'Furniture',
            'Accessibility' => 'Accessibility',
            'Safety' => 'Safety',
            'Audio/Visual' => 'Audio/Visual',
            'Other' => 'Other'
        ];
    }
}
