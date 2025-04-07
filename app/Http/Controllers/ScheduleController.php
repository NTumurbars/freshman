<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Schedule;
use App\Models\Section;
use App\Models\Room;
use App\Models\School;
use App\Models\Department;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    // GET /schools/{school}/schedules
    public function index(School $school)
    {
        $this->authorize('viewAny', Schedule::class);
        
        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $schoolCourseIds = Course::whereIn('department_id', $schoolDepartmentIds)->pluck('id');
        
        // Get sections from this school
        $sectionIds = Section::whereIn('course_id', $schoolCourseIds)->pluck('id');
        
        // Base query
        $schedulesQuery = Schedule::with([
                'section.course.department', 
                'section.professor', 
                'room.floor.building'
            ])
            ->whereIn('section_id', $sectionIds);
        
        // If user is a professor, only show their schedules
        $user = Auth::user();
        $isProfessor = $user->role_id === 4; // Professor role ID
        
        if ($isProfessor) {
            $schedulesQuery->whereHas('section', function($query) use ($user) {
                $query->where('professor_id', $user->id);
            });
        }
        
        $schedules = $schedulesQuery->get();
            
        // Get rooms for admin calendar view with their schedules and necessary relationships
        $rooms = Room::with(['floor.building', 'schedules.section.professor', 'schedules.section.course'])
            ->whereHas('floor.building', function($query) use ($school) {
                $query->where('school_id', $school->id);
            })
            ->get();
            
        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules,
            'rooms' => $rooms,
            'school' => $school,
            'isProfessor' => $isProfessor
        ]);
    }

    // GET /schools/{school}/schedules/create
    public function create(School $school, Request $request)
    {
        $this->authorize('create', Schedule::class);
        
        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $schoolCourseIds = Course::whereIn('department_id', $schoolDepartmentIds)->pluck('id');
            
        // Get sections from this school
        $query = Section::with('course')
            ->whereIn('course_id', $schoolCourseIds);
            
        // If section_id was passed, prefill that section
        $selectedSectionId = $request->query('section_id');
        if ($selectedSectionId) {
            $query->orWhere('id', $selectedSectionId);
        }
        
        $sections = $query->get();
        $rooms = Room::with('floor.building')->get();
        
        return Inertia::render('Schedules/Create', [
            'sections' => $sections,
            'rooms' => $rooms,
            'school' => $school,
            'preselectedSectionId' => $selectedSectionId
        ]);
    }

    // POST /schools/{school}/schedules
    public function store(School $school, Request $request)
    {
        $this->authorize('create', Schedule::class);
        
        try {
            // Debug the incoming request data
            $dayOfWeek = $request->input('day_of_week');
            Log::info('Schedule creation request:', [
                'day_of_week' => $dayOfWeek,
                'meeting_pattern' => $request->input('meeting_pattern'),
                'data' => $request->all()
            ]);
            
            // Normalize location_type
            $requestData = $request->all();
            if (isset($requestData['location_type']) && $requestData['location_type'] === 'in_person') {
                $requestData['location_type'] = 'in-person';
            }
            
            // Validate the request data
            $validationRules = [
                'section_id'  => 'required|exists:sections,id',
                'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
                'start_time'  => 'required|date_format:H:i:s,H:i',
                'end_time'    => 'required|date_format:H:i:s,H:i|after:start_time',
                'location_type' => 'required|string|in:in-person,virtual,hybrid',
                'meeting_pattern' => 'required|string|in:single,weekly,monday-wednesday-friday,tuesday-thursday,monday-wednesday,tuesday-friday',
            ];

            // Add conditional validation rules
            if (isset($requestData['location_type']) && $requestData['location_type'] === 'virtual') {
                $validationRules['virtual_meeting_url'] = 'required|url';
                $validationRules['room_id'] = 'nullable|exists:rooms,id';
            } else {
                $validationRules['room_id'] = 'required|exists:rooms,id';
                $validationRules['virtual_meeting_url'] = 'required_if:location_type,hybrid|nullable|url';
            }

            // Validate the data
            $validator = validator($requestData, $validationRules);
            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }
            
            $validatedData = $validator->validated();
            
            // Format times consistently
            $start_time = $validatedData['start_time'];
            $end_time = $validatedData['end_time'];
            
            if (!str_contains($start_time, ':')) {
                $start_time .= ':00';
            } else if (substr_count($start_time, ':') === 1) {
                $start_time .= ':00';
            }
            
            if (!str_contains($end_time, ':')) {
                $end_time .= ':00';
            } else if (substr_count($end_time, ':') === 1) {
                $end_time .= ':00';
            }

            // Verify section belongs to this school
            $section = Section::with('course.department')->findOrFail($validatedData['section_id']);
            if ($section->course->department->school_id !== $school->id) {
                return back()->withErrors(['section_id' => 'The selected section does not belong to this school.']);
            }

            // Check for conflicts
            $checkData = [
                'section_id' => $validatedData['section_id'],
                'room_id' => $validatedData['room_id'] ?? null,
                'day_of_week' => $validatedData['day_of_week'],
                'start_time' => $start_time,
                'end_time' => $end_time,
                'location_type' => $validatedData['location_type'],
            ];
            
            if ($conflict = $this->checkScheduleConflicts($checkData)) {
                return back()->withErrors($conflict);
            }

            // Directly create a new schedule with all attributes
            $schedule = new Schedule();
            $schedule->section_id = $validatedData['section_id'];
            $schedule->room_id = $validatedData['room_id'] ?? null;
            $schedule->day_of_week = $validatedData['day_of_week']; // Set day explicitly
            $schedule->start_time = $start_time;
            $schedule->end_time = $end_time;
            $schedule->location_type = $validatedData['location_type'];
            $schedule->virtual_meeting_url = $validatedData['virtual_meeting_url'] ?? null;
            
            // Save the actual meeting pattern instead of forcing it to 'single'
            $schedule->meeting_pattern = $validatedData['meeting_pattern'];
            
            // Log the data we're about to save
            Log::info('Saving schedule with data:', [
                'section_id' => $schedule->section_id,
                'day_of_week' => $schedule->day_of_week,
                'meeting_pattern' => $schedule->meeting_pattern,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time
            ]);
            
            // Save the schedule
            $schedule->save();
            
            // Verify the saved data
            $savedSchedule = Schedule::find($schedule->id);
            Log::info('Verified saved schedule:', [
                'id' => $savedSchedule->id,
                'day_of_week' => $savedSchedule->day_of_week,
                'pattern' => $savedSchedule->meeting_pattern
            ]);
            
            // Always redirect to the section show page
            return redirect()->route('sections.show', [$school->id, $section->id])
                ->with('success', 'Schedule created successfully');
                
        } catch (\Exception $e) {
            Log::error('Error in schedule creation:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['general' => 'An error occurred: ' . $e->getMessage()]);
        }
    }

    // GET /schools/{school}/schedules/{schedule}/edit
    public function edit(School $school, Schedule $schedule)
    {
        try {
            $this->authorize('update', $schedule);
            
            // Make sure the schedule exists
            if (!$schedule || !$schedule->exists) {
                return redirect()->route('sections.index', $school->id)
                    ->with('error', 'The schedule you are trying to edit does not exist.');
            }
            
            // Get departments that belong to this school
            $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

            // Get courses that belong to these departments
            $schoolCourseIds = Course::whereIn('department_id', $schoolDepartmentIds)->pluck('id');
            
            // Get sections from this school
            $sections = Section::with('course')
                ->whereIn('course_id', $schoolCourseIds)
                ->get();
                
            // Make sure to load the section with its course
            $schedule->load(['section.course', 'room.floor.building']);
            
            $rooms = Room::with('floor.building')->get();
            
            return Inertia::render('Schedules/Edit', [
                'schedule' => $schedule,
                'sections' => $sections,
                'rooms' => $rooms,
                'school' => $school
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Log the error
            Log::error('Schedule not found:', [
                'schedule_id' => request()->route('schedule'),
                'school_id' => $school->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->route('sections.index', $school->id)
                ->with('error', 'The schedule you are trying to edit does not exist.');
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error in schedule edit:', [
                'schedule_id' => $schedule->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('sections.index', $school->id)
                ->with('error', 'An error occurred while trying to edit the schedule.');
        }
    }

    // PUT /schools/{school}/schedules/{schedule}
    public function update(School $school, Request $request, Schedule $schedule)
    {
        $this->authorize('update', $schedule);
        
        Log::info('Schedule update data:', $request->all());
        
        $data = $request->validate([
            'section_id'  => 'required|exists:sections,id',
            'room_id'     => 'required_if:location_type,in-person,hybrid|exists:rooms,id',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time'  => 'required|date_format:H:i:s,H:i',
            'end_time'    => 'required|date_format:H:i:s,H:i|after:start_time',
            'location_type' => 'required|string|in:in-person,virtual,hybrid',
            'virtual_meeting_url' => 'required_if:location_type,virtual,hybrid|nullable|url',
            'meeting_pattern' => 'nullable|string|in:single,weekly,monday-wednesday-friday,tuesday-thursday,monday-wednesday,tuesday-friday',
        ]);

        // Ensure time format is consistent with seconds
        if (!str_contains($data['start_time'], ':')) {
            $data['start_time'] .= ':00';
        } else if (substr_count($data['start_time'], ':') === 1) {
            $data['start_time'] .= ':00';
        }
        
        if (!str_contains($data['end_time'], ':')) {
            $data['end_time'] .= ':00';
        } else if (substr_count($data['end_time'], ':') === 1) {
            $data['end_time'] .= ':00';
        }

        Log::info('Schedule update after time format:', $data);

        // Verify section belongs to this school
        $section = Section::findOrFail($data['section_id']);
        $course = $section->course;
        
        if (!$course || !$course->department || $course->department->school_id !== $school->id) {
            return back()->withErrors(['section_id' => 'The selected section does not belong to this school.']);
        }

        // Check for conflicts
        if ($conflict = $this->checkScheduleConflicts($data, $schedule->id)) {
            return back()->withErrors($conflict);
        }

        $schedule->update($data);
        
        Log::info('Schedule updated successfully:', ['id' => $schedule->id]);
        
        // Always redirect to the section show page
        return redirect()->route('sections.show', [$school->id, $section->id])
            ->with('success', 'Schedule updated successfully');
    }

    // DELETE /schools/{school}/schedules/{schedule}
    public function destroy(School $school, Schedule $schedule)
    {
        $this->authorize('delete', $schedule);
        $schedule->delete();
        return redirect()->route('schedules.index', $school->id)
            ->with('success', 'Schedule deleted successfully');
    }

    // DELETE /schools/{school}/sections/{section}/schedules
    public function destroyAll(School $school, $sectionId)
    {
        // Find the section
        $section = Section::findOrFail($sectionId);
        
        // Check authorization - if user can create schedules, they should be able to manage them
        $this->authorize('create', Schedule::class);
        
        // Verify section belongs to this school
        $course = $section->course;
        if (!$course || !$course->department || $course->department->school_id !== $school->id) {
            return response()->json(['error' => 'The selected section does not belong to this school.'], 403);
        }
        
        // Delete all schedules for this section
        $deleteCount = Schedule::where('section_id', $sectionId)->delete();
        
        Log::info("Deleted all schedules for section {$sectionId}", ['count' => $deleteCount]);
        
        // Return response based on request type
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => "All schedules for section {$sectionId} deleted successfully",
                'count' => $deleteCount
            ]);
        }
        
        return redirect()->back()
            ->with('success', "All schedules for this section deleted successfully");
    }

    // GET /schools/{school}/schedules/{schedule}
    public function show(School $school, Schedule $schedule)
    {
        $this->authorize('view', $schedule);
        
        $schedule->load([
            'section.course',
            'section.professor',
            'room.floor.building'
        ]);

        return Inertia::render('Schedules/Show', [
            'schedule' => $schedule,
            'school' => $school
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

        // Check room conflicts - only check for physical location conflicts
        if (isset($data['location_type']) && ($data['location_type'] === 'in-person' || $data['location_type'] === 'hybrid') && isset($data['room_id'])) {
            $roomQuery = Schedule::where('room_id', $data['room_id'])
                ->where('day_of_week', $data['day_of_week']);

            if ($excludeId) {
                $roomQuery->where('id', '!=', $excludeId);
            }

            if ($roomQuery->where($query)->exists()) {
                return ['room_id' => 'This room is already scheduled during this time slot'];
            }
        }

        // Check section conflicts - always check to avoid double-booking a section
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

    /**
     * Create multiple schedules for a pattern at once
     * POST /schools/{school}/schedules-batch
     */
    public function storeBatch(School $school, Request $request)
    {
        $this->authorize('create', Schedule::class);
        
        try {
            // Validate the request data
            $validationRules = [
                'section_id'  => 'required|exists:sections,id',
                'room_id'     => 'required_if:location_type,in-person,hybrid|exists:rooms,id',
                'start_time'  => 'required|date_format:H:i:s,H:i',
                'end_time'    => 'required|date_format:H:i:s,H:i|after:start_time',
                'location_type' => 'required|string|in:in-person,virtual,hybrid',
                'virtual_meeting_url' => 'required_if:location_type,virtual,hybrid|nullable|url',
                'meeting_pattern' => 'required|string|in:single,weekly,monday-wednesday-friday,tuesday-thursday,monday-wednesday,tuesday-friday',
            ];
            
            // Validate the data
            $validatedData = $request->validate($validationRules);
            
            // Verify section belongs to this school
            $section = Section::with('course.department')->findOrFail($validatedData['section_id']);
            if ($section->course->department->school_id !== $school->id) {
                return response()->json(['error' => 'The selected section does not belong to this school.'], 403);
            }
            
            // Format times consistently
            $start_time = $validatedData['start_time'];
            $end_time = $validatedData['end_time'];
            
            if (!str_contains($start_time, ':')) {
                $start_time .= ':00';
            } else if (substr_count($start_time, ':') === 1) {
                $start_time .= ':00';
            }
            
            if (!str_contains($end_time, ':')) {
                $end_time .= ':00';
            } else if (substr_count($end_time, ':') === 1) {
                $end_time .= ':00';
            }
            
            // Delete existing schedules for this section first
            $deleteCount = Schedule::where('section_id', $validatedData['section_id'])->delete();
            Log::info("Deleted {$deleteCount} existing schedules for section {$validatedData['section_id']}");
            
            // Determine which days of the week to create schedules for based on the pattern
            $daysOfWeek = $this->getDaysFromPattern($validatedData['meeting_pattern'], $request->input('day_of_week', 'Monday'));
            
            Log::info("Creating schedules for pattern {$validatedData['meeting_pattern']} on days:", $daysOfWeek);
            
            $createdCount = 0;
            $errors = [];
            
            // Create a schedule for each day in the pattern
            foreach ($daysOfWeek as $day) {
                try {
                    $scheduleData = [
                        'section_id' => $validatedData['section_id'],
                        'room_id' => $validatedData['room_id'] ?? null,
                        'day_of_week' => $day,
                        'start_time' => $start_time,
                        'end_time' => $end_time,
                        'location_type' => $validatedData['location_type'],
                        'virtual_meeting_url' => $validatedData['virtual_meeting_url'] ?? null,
                        'meeting_pattern' => $validatedData['meeting_pattern'],
                    ];
                    
                    // Check for conflicts
                    if ($conflict = $this->checkScheduleConflicts($scheduleData)) {
                        $errors[] = "Conflict for {$day}: " . json_encode($conflict);
                        continue;
                    }
                    
                    // Create schedule
                    $schedule = new Schedule($scheduleData);
                    $schedule->save();
                    $createdCount++;
                    
                    Log::info("Created schedule for {$day}");
                } catch (\Exception $e) {
                    Log::error("Error creating schedule for {$day}: " . $e->getMessage());
                    $errors[] = "Error for {$day}: " . $e->getMessage();
                }
            }
            
            $responseData = [
                'success' => $createdCount > 0,
                'created_count' => $createdCount,
                'errors' => $errors,
                'pattern' => $validatedData['meeting_pattern'],
                'days' => $daysOfWeek,
            ];
            
            if ($request->expectsJson()) {
                return response()->json($responseData);
            }
            
            if (count($errors) > 0) {
                $errorMessage = "Created {$createdCount} schedules, but encountered errors: " . implode("; ", $errors);
                return redirect()->route('sections.show', [$school->id, $validatedData['section_id']])
                    ->with('warning', $errorMessage);
            }
            
            return redirect()->route('sections.show', [$school->id, $validatedData['section_id']])
                ->with('success', "Created {$createdCount} schedules successfully");
        } catch (\Exception $e) {
            Log::error("Error in batch schedule creation: " . $e->getMessage());
            
            if ($request->expectsJson()) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
            
            return back()->withErrors(['general' => 'An error occurred: ' . $e->getMessage()]);
        }
    }

    /**
     * Get days of the week based on a meeting pattern
     */
    private function getDaysFromPattern($pattern, $fallbackDay = 'Monday')
    {
        switch ($pattern) {
            case 'monday-wednesday-friday':
                return ['Monday', 'Wednesday', 'Friday'];
            case 'tuesday-thursday':
                return ['Tuesday', 'Thursday'];
            case 'monday-wednesday':
                return ['Monday', 'Wednesday'];
            case 'tuesday-friday':
                return ['Tuesday', 'Friday'];
            case 'weekly':
                return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            case 'single':
            default:
                return [$fallbackDay];
        }
    }
}
