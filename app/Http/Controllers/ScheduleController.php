<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Schedule;
use App\Models\Section;
use App\Models\Room;
use Illuminate\Http\Request;
// We need the show methods for this class 
// GET|HEAD show schools/{school}/schedules/{schedule} 
class ScheduleController extends Controller
{
    // GET /schedules
    public function index()
    {
        $this->authorize('viewAny', Schedule::class);
        $schedules = Schedule::with(['section', 'room'])->get();
        return Inertia::render('Schedules/Index', ['schedules' => $schedules]);
    }

    // GET /schedules/create
    public function create()
    {
        $this->authorize('create', Schedule::class);
        $sections = Section::all();
        $rooms = Room::all();
        return Inertia::render('Schedules/Create', [
            'sections' => $sections,
            'rooms' => $rooms,
        ]);
    }

    // POST /schedules
    public function store(Request $request)
    {
        $this->authorize('create', Schedule::class);
        $data = $request->validate([
            'section_id'  => 'required|exists:sections,id',
            'room_id'     => 'required|exists:rooms,id',
            'day_of_week' => 'required|string|max:20',
            'start_time'  => 'required|date_format:H:i:s',
            'end_time'    => 'required|date_format:H:i:s|after:start_time',
        ]);

        Schedule::create($data);
        return redirect()->route('schedules.index')->with('success', 'Schedule created successfully');
    }

    // GET /schedules/{id}/edit
    public function edit($id)
    {
        $schedule = Schedule::findOrFail($id);
        $this->authorize('update', $schedule);
        $sections = Section::all();
        $rooms = Room::all();
        return Inertia::render('Schedules/Edit', [
            'schedule' => $schedule,
            'sections' => $sections,
            'rooms' => $rooms,
        ]);
    }

    // PUT /schedules/{id}
    public function update(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);
        $this->authorize('update', $schedule);
        $data = $request->validate([
            'section_id'  => 'required|exists:sections,id',
            'room_id'     => 'required|exists:rooms,id',
            'day_of_week' => 'required|string|max:20',
            'start_time'  => 'required|date_format:H:i:s',
            'end_time'    => 'required|date_format:H:i:s|after:start_time',
        ]);

        $schedule->update($data);
        return redirect()->route('schedules.index')->with('success', 'Schedule updated successfully');
    }

    // DELETE /schedules/{id}
    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);
        $this->authorize('delete', $schedule);
        $schedule->delete();
        return redirect()->route('schedules.index')->with('success', 'Schedule deleted successfully');
    }
}
