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
        $features = RoomFeature::all();
        return Inertia::render('RoomFeatures/Index', ['features' => $features]);
    }

    // GET /room-features/create
    public function create()
    {
        return Inertia::render('RoomFeatures/Create');
    }

    // POST /room-features
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|unique:room_features,name',
            'description' => 'nullable|string',
        ]);

        RoomFeature::create($data);
        return redirect()->route('room-features.index')->with('success', 'Room feature created successfully');
    }

    // GET /room-features/{id}/edit
    public function edit($id)
    {
        $feature = RoomFeature::findOrFail($id);
        return Inertia::render('RoomFeatures/Edit', ['feature' => $feature]);
    }

    // PUT /room-features/{id}
    public function update(Request $request, $id)
    {
        $feature = RoomFeature::findOrFail($id);
        $data = $request->validate([
            'name'        => 'required|string|unique:room_features,name,' . $feature->id,
            'description' => 'nullable|string',
        ]);

        $feature->update($data);
        return redirect()->route('room-features.index')->with('success', 'Room feature updated successfully');
    }

    // DELETE /room-features/{id}
    public function destroy($id)
    {
        $feature = RoomFeature::findOrFail($id);
        $feature->delete();
        return redirect()->route('room-features.index')->with('success', 'Room feature deleted successfully');
    }

    // GET room-features/{room_feature}
    public function show($id)
    {
        $features = RoomFeature::findorFail($id);
        return Inertia::render('RoomFeatures/Show', ['features' => $features]);
    }
}
