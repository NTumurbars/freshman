<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\Section;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ScheduleService
{
    public function create(array $payload): Schedule
    {
        return DB::transaction(function () use ($payload) {
            $this->guardAgainstConflict($payload);

            /** @var Section $section */
            $section = Section::findOrFail($payload['section_id']);
            if (($payload['update_section_capacity'] ?? false) && !empty($payload['new_capacity'])) {
                $section->update(['capacity' => $payload['new_capacity']]);
            }

            return Schedule::create($payload);
        });
    }

    public function update(Schedule $schedule, array $payload): Schedule
    {
        return DB::transaction(function () use ($schedule, $payload) {
            $this->guardAgainstConflict($payload, $schedule->id);

            if (($payload['update_section_capacity'] ?? false) && !empty($payload['new_capacity'])) {
                $schedule->section->update(['capacity' => $payload['new_capacity']]);
            }

            $schedule->update($payload);
            return $schedule->refresh();
        });
    }

    /*------------------------------------------------------
    | Helpers                                             |
    ------------------------------------------------------*/
    private function guardAgainstConflict(array $d, ?int $ignore = null): void
    {
        $conflict = Schedule::query()
            ->when($ignore,   fn($q)=>$q->where('id','!=',$ignore))
            ->when(in_array($d['location_type'], ['in-person','hybrid']),
                fn($q)=>$q->where('room_id',$d['room_id']))
            ->where('day_of_week',$d['day_of_week'])
            ->where('start_time','<', $d['end_time'])
            ->where('end_time','>', $d['start_time'])
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages(['conflict' => 'Schedule overlaps an existing booking']);
        }
    }
}
