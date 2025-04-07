<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Schedule;
use App\Models\Section;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class ScheduleController extends Controller
{
    // GET /schedules
    public function index()
    {
        $this->authorize('viewAny', Schedule::class);
        $schedules = Schedule::with(['section.course', 'room.floor.building'])->get();
        return Inertia::render('Schedules/Index', ['schedules' => $schedules]);
    }

    // GET /schedules/create
    public function create()
    {
        $this->authorize('create', Schedule::class);
        $sections = Section::with('course')->get();
        $rooms = Room::with('floor.building')->get();
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
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time'  => 'required|date_format:H:i:s',
            'end_time'    => 'required|date_format:H:i:s|after:start_time',
        ]);

        // Check for conflicts
        if ($conflict = $this->checkScheduleConflicts($data)) {
            return back()->withErrors($conflict);
        }

        $schedule = Schedule::create($data);
        return redirect()->route('schedules.index')->with('success', 'Schedule created successfully');
    }

    // GET /schedules/{id}/edit
    public function edit(int $id)
    {
        $schedule = Schedule::findOrFail($id);
        $this->authorize('update', $schedule);
        $sections = Section::with('course')->get();
        $rooms = Room::with('floor.building')->get();
        return Inertia::render('Schedules/Edit', [
            'schedule' => $schedule,
            'sections' => $sections,
            'rooms' => $rooms,
        ]);
    }

    // PUT /schedules/{id}
    public function update(Request $request, int $id)
    {
        $schedule = Schedule::findOrFail($id);
        $this->authorize('update', $schedule);
        $data = $request->validate([
            'section_id'  => 'required|exists:sections,id',
            'room_id'     => 'required|exists:rooms,id',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time'  => 'required|date_format:H:i:s',
            'end_time'    => 'required|date_format:H:i:s|after:start_time',
        ]);

        // Check for conflicts
        if ($conflict = $this->checkScheduleConflicts($data, $schedule->id)) {
            return back()->withErrors($conflict);
        }

        $schedule->update($data);
        return redirect()->route('schedules.index')->with('success', 'Schedule updated successfully');
    }

    // DELETE /schedules/{id}
    public function destroy(int $id)
    {
        $schedule = Schedule::findOrFail($id);
        $this->authorize('delete', $schedule);
        $schedule->delete();
        return redirect()->route('schedules.index')->with('success', 'Schedule deleted successfully');
    }

    // GET schools/{school}/schedules/{schedule}
    public function show(int $id)
    {
        $schedule = Schedule::with([
            'section.course',
            'section.professor',
            'room.floor.building'
        ])->findOrFail($id);

        $this->authorize('view', $schedule);

        return Inertia::render('Schedules/Show', [
            'schedule' => $schedule
        ]);
    }

    /**
     * Check for scheduling conflicts
     *
     * @param array $data Schedule data
     * @param int|null $excludeId Schedule ID to exclude from conflict check
     * @return array|null Array of errors if conflict found, null otherwise
     */
    private function checkScheduleConflicts(array $data, ?int $excludeId = null): ?array
    {
        $query = function (Builder $query) use ($data) {
            $query->whereBetween('start_time', [$data['start_time'], $data['end_time']])
                ->orWhereBetween('end_time', [$data['start_time'], $data['end_time']])
                ->orWhere(function($query) use ($data) {
                    $query->where('start_time', '<=', $data['start_time'])
                        ->where('end_time', '>=', $data['end_time']);
                });
        };

        // Check room conflicts
        $roomQuery = Schedule::where('room_id', $data['room_id'])
            ->where('day_of_week', $data['day_of_week']);

        if ($excludeId) {
            $roomQuery->where('id', '!=', $excludeId);
        }

        if ($roomQuery->where($query)->exists()) {
            return ['room_id' => 'This room is already scheduled during this time slot'];
        }

        // Check section conflicts
        $sectionQuery = Schedule::where('section_id', $data['section_id'])
            ->where('day_of_week', $data['day_of_week']);

        if ($excludeId) {
            $sectionQuery->where('id', '!=', $excludeId);
        }

        if ($sectionQuery->where($query)->exists()) {
            return ['section_id' => 'This section is already scheduled during this time slot'];
        }

        return null;
    }
}
