<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Course;
use App\Models\Department;
use App\Models\School;
use App\Models\Term;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class StatsController extends Controller
{
    public function superUser(): JsonResponse
    {
        $schools = School::all()->count();
        $departments = Department::all()->count();
        $users = User::all()->count();

        // Get all active terms (current date falls between start_date and end_date)
        // Use today's date at start of day to ensure proper date comparisons
        $today = Carbon::now()->startOfDay();
        $activeTerms = Term::where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->count();

        return response()->json([
            'schools' => $schools,
            'users' => $users,
            'activeTerms' => $activeTerms,
        ]);
    }

    public function schoolAdmin(): JsonResponse
    {
        $school_id = Auth::user()->school_id;
        $departments = Department::where('school_id', $school_id)->with('courses')->count();
        $users = User::where('school_id', $school_id)->count();
        $buildings = Building::where('school_id', $school_id)->count();

        // Get current term (where current date falls between start_date and end_date)
        // Use today's date at start of day to ensure proper date comparisons
        $today = Carbon::now()->startOfDay();
        $currentTerm = Term::where('school_id', $school_id)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->first();

        // Get active courses for current term
        $activeCourses = 0;
        if ($currentTerm) {
            $activeCourses = Course::where('is_active', true)
                ->whereHas('sections', function($query) use ($currentTerm) {
                    $query->where('term_id', $currentTerm->id);
                })->count();
        }

        // Room utilization stats
        $roomStats = $this->getRoomUtilizationStats($school_id, $currentTerm);

        // Count schedule conflicts
        $scheduleConflicts = 0; // You can implement your conflict detection logic here

        return response()->json([
            'departments' => $departments,
            'users' => $users,
            'buildings' => $buildings,
            'currentTerm' => $currentTerm,
            'activeCourses' => $activeCourses,
            'scheduleConflicts' => $scheduleConflicts,
            'roomUtilization' => $roomStats['utilizationPercentage'],
            'roomStats' => $roomStats,
        ]);
    }

    /**
     * Calculate room utilization statistics
     *
     * @param int $schoolId The school ID
     * @param Term|null $currentTerm The current term model
     * @return array Room utilization statistics
     */
    private function getRoomUtilizationStats($schoolId, $currentTerm = null)
    {
        // Get all rooms in the school
        $rooms = \App\Models\Room::whereHas('floor.building', function ($query) use ($schoolId) {
            $query->where('school_id', $schoolId);
        })->with(['schedules' => function ($query) use ($currentTerm) {
            if ($currentTerm) {
                $query->whereHas('section', function ($q) use ($currentTerm) {
                    $q->where('term_id', $currentTerm->id);
                });
            }
        }])->get();

        $totalRooms = $rooms->count();
        $roomsWithSchedules = 0;
        $totalTimeSlots = 0;
        $usedTimeSlots = 0;
        $timeBlocksPerDay = 12; // Assuming 12 hours of operation per day (8am-8pm)
        $daysPerWeek = 5; // Monday to Friday
        $maxPossibleSlotsPerRoom = $timeBlocksPerDay * $daysPerWeek;

        // Rooms with most available slots
        $roomAvailability = [];

        foreach ($rooms as $room) {
            $scheduledSlotsCount = $room->schedules->count();

            if ($scheduledSlotsCount > 0) {
                $roomsWithSchedules++;
            }

            $usedTimeSlots += $scheduledSlotsCount;
            $availableSlots = $maxPossibleSlotsPerRoom - $scheduledSlotsCount;

            $roomAvailability[] = [
                'id' => $room->id,
                'name' => $room->name,
                'room_number' => $room->room_number,
                'building' => $room->floor->building->name ?? 'Unknown',
                'capacity' => $room->capacity,
                'used_slots' => $scheduledSlotsCount,
                'available_slots' => $availableSlots,
                'utilization_percentage' => $maxPossibleSlotsPerRoom > 0
                    ? round(($scheduledSlotsCount / $maxPossibleSlotsPerRoom) * 100, 1)
                    : 0
            ];
        }

        // Sort rooms by available slots (most available first)
        usort($roomAvailability, function($a, $b) {
            return $b['available_slots'] - $a['available_slots'];
        });

        // Calculate total possible time slots across all rooms
        $totalPossibleSlots = $totalRooms * $maxPossibleSlotsPerRoom;

        // Calculate utilization percentage
        $utilizationPercentage = $totalPossibleSlots > 0
            ? round(($usedTimeSlots / $totalPossibleSlots) * 100, 1)
            : 0;

        // Get top 5 most available rooms and top 5 most utilized rooms
        $mostAvailableRooms = array_slice($roomAvailability, 0, 5);

        // Sort by utilization percentage (highest first)
        usort($roomAvailability, function($a, $b) {
            return $b['utilization_percentage'] - $a['utilization_percentage'];
        });

        $mostUtilizedRooms = array_slice($roomAvailability, 0, 5);

        return [
            'totalRooms' => $totalRooms,
            'roomsWithSchedules' => $roomsWithSchedules,
            'roomsUtilizedPercentage' => $totalRooms > 0 ? round(($roomsWithSchedules / $totalRooms) * 100, 1) : 0,
            'utilizationPercentage' => $utilizationPercentage,
            'mostAvailableRooms' => $mostAvailableRooms,
            'mostUtilizedRooms' => $mostUtilizedRooms
        ];
    }
}
