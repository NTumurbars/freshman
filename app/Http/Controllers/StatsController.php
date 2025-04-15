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
use Illuminate\Http\Request;
use App\Models\Section;
use App\Models\Schedule;
use App\Models\CourseRegistration;
use App\Models\ProfessorProfile;
use Inertia\Inertia;

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
        $timeBlocksPerDay = 12; // (8am-8pm)
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

    /**
     * Get statistics for the professor dashboard
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function professorStats(Request $request)
    {
        $user = Auth::user();
        $school = $user->school;

        // Find the professor profile
        $professorProfile = ProfessorProfile::where('user_id', $user->id)->first();

        if (!$professorProfile) {
            return response()->json([
                'error' => 'Professor profile not found',
                'stats' => [
                    'total_sections' => 0,
                    'total_students' => 0,
                    'upcoming_classes' => [],
                    'current_term' => null,
                    'course_stats' => [],
                    'student_stats' => []
                ],
                'professor_profile' => null,
                'school' => $school
            ]);
        }

        // Get active term
        $today = Carbon::now()->startOfDay();
        $currentTerm = Term::where('school_id', $school->id)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->first();

        // Get all terms for historical data
        $allTerms = Term::where('school_id', $school->id)
            ->orderBy('start_date', 'desc')
            ->get();

        // Get sections taught by this professor
        $sectionsQuery = Section::where('professor_profile_id', $professorProfile->id)
            ->with(['course.department', 'term', 'schedules.room.floor.building', 'courseRegistrations.student']);

        // Get all sections for historical data
        $allSections = $sectionsQuery->get();

        // Current term sections
        $currentTermSections = collect([]);
        if ($currentTerm) {
            $currentTermSections = $allSections->where('term_id', $currentTerm->id);
        }

        // Count total students across all sections
        $totalStudents = 0;
        $totalCurrentStudents = 0;
        $studentsByCourse = [];
        $studentsByTerm = [];

        foreach ($allSections as $section) {
            $studentCount = $section->courseRegistrations->count();
            $totalStudents += $studentCount;

            // Track students by course
            $courseKey = $section->course->title;
            if (!isset($studentsByCourse[$courseKey])) {
                $studentsByCourse[$courseKey] = [
                    'title' => $section->course->title,
                    'code' => $section->course->code,
                    'count' => 0
                ];
            }
            $studentsByCourse[$courseKey]['count'] += $studentCount;

            // Track students by term
            $termKey = $section->term->id;
            if (!isset($studentsByTerm[$termKey])) {
                $studentsByTerm[$termKey] = [
                    'term_name' => $section->term->name,
                    'count' => 0
                ];
            }
            $studentsByTerm[$termKey]['count'] += $studentCount;

            // Track current term students
            if ($currentTerm && $section->term_id === $currentTerm->id) {
                $totalCurrentStudents += $studentCount;
            }
        }

        // Convert associative arrays to indexed arrays
        $studentsByCourse = array_values($studentsByCourse);
        $studentsByTerm = array_values($studentsByTerm);

        // Sort student stats
        usort($studentsByCourse, function($a, $b) {
            return $b['count'] - $a['count'];
        });

        // Get unique courses taught
        $uniqueCourses = $allSections->pluck('course')->unique('id');

        // Calculate teaching load stats
        $sectionsByTerm = [];
        foreach ($allTerms as $term) {
            $termSections = $allSections->where('term_id', $term->id);
            if ($termSections->count() > 0) {
                $sectionsByTerm[] = [
                    'term_name' => $term->name,
                    'term_id' => $term->id,
                    'section_count' => $termSections->count(),
                    'student_count' => $termSections->sum(function($section) {
                        return $section->courseRegistrations->count();
                    }),
                    'is_current' => $currentTerm && $term->id === $currentTerm->id
                ];
            }
        }

        // Get upcoming classes (next 7 days)
        $today = Carbon::now();
        $todayDayOfWeek = $today->format('l'); // Current day of week
        $upcomingClasses = [];
        $todayClasses = [];

        foreach ($currentTermSections as $section) {
            foreach ($section->schedules as $schedule) {
                // Calculate the next occurrence of this class based on day of week
                $nextClass = $this->getNextOccurrence($today, $schedule->day_of_week);

                $classData = [
                    'id' => $schedule->id,
                    'section_id' => $section->id,
                    'course_title' => $section->course->title,
                    'course_code' => $section->course->code,
                    'section_code' => $section->section_code,
                    'day_of_week' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'room' => $schedule->room ? $schedule->room->room_number . ' (' . $schedule->room->floor->building->name . ')' : 'Online',
                    'next_date' => $nextClass->format('Y-m-d'),
                    'students_count' => $section->courseRegistrations->count(),
                    'days_away' => $nextClass->diffInDays($today),
                    'is_today' => $schedule->day_of_week === $todayDayOfWeek
                ];

                // Only include classes in the next 7 days
                if ($nextClass->diffInDays($today) <= 7) {
                    $upcomingClasses[] = $classData;

                    // Add to today's classes if it's today
                    if ($schedule->day_of_week === $todayDayOfWeek) {
                        $todayClasses[] = $classData;
                    }
                }
            }
        }

        // Sort upcoming classes by date and time
        usort($upcomingClasses, function($a, $b) {
            if ($a['next_date'] === $b['next_date']) {
                return strcmp($a['start_time'], $b['start_time']);
            }
            return strcmp($a['next_date'], $b['next_date']);
        });

        // Sort today's classes by start time
        usort($todayClasses, function($a, $b) {
            return strcmp($a['start_time'], $b['start_time']);
        });

        // Get department info if available
        $department = null;
        if ($professorProfile->department) {
            $department = [
                'id' => $professorProfile->department->id,
                'name' => $professorProfile->department->name,
                'course_count' => Course::where('department_id', $professorProfile->department_id)->count()
            ];
        }

        // At the end of the method, make sure to include the school in the response
        return response()->json([
            'stats' => [
                // Basic stats
                'total_sections' => $allSections->count(),
                'current_term_sections' => $currentTermSections->count(),
                'total_students' => $totalStudents,
                'current_term_students' => $totalCurrentStudents,
                'unique_courses_count' => $uniqueCourses->count(),

                // Current term info
                'current_term' => $currentTerm,

                // Department info
                'department' => $department,

                // Classes
                'today_classes' => $todayClasses,
                'upcoming_classes' => $upcomingClasses,

                // Historical data
                'sections_by_term' => $sectionsByTerm,
                'students_by_term' => $studentsByTerm,
                'students_by_course' => $studentsByCourse,
            ],
            'professor_profile' => $professorProfile->load('department'),
            'school' => $school
        ]);
    }

    /**
     * Get the next occurrence of a specific day of week
     *
     * @param Carbon $today
     * @param string $dayOfWeek
     * @return Carbon
     */
    private function getNextOccurrence(Carbon $today, string $dayOfWeek)
    {
        $daysOfWeek = [
            'Sunday' => 0,
            'Monday' => 1,
            'Tuesday' => 2,
            'Wednesday' => 3,
            'Thursday' => 4,
            'Friday' => 5,
            'Saturday' => 6
        ];

        $todayDayNum = $today->dayOfWeek;
        $targetDayNum = $daysOfWeek[$dayOfWeek];

        // If it's the same day, return today
        if ($todayDayNum === $targetDayNum) {
            return $today->copy();
        }

        // Calculate days to add
        $daysToAdd = ($targetDayNum - $todayDayNum + 7) % 7;
        if ($daysToAdd === 0) {
            $daysToAdd = 7;
        }

        return $today->copy()->addDays($daysToAdd);
    }
}
