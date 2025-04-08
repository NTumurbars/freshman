<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Section;
use App\Models\Course;
use App\Models\Term;
use App\Models\School;
use App\Models\Department;
use App\Models\User;
use App\Models\Room;
use App\Models\RoomFeature;
use App\Models\ProfessorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

// We need to add the show method for this class
// GET|HEAD show schools/{school}/sections/{section}
class SectionController extends Controller
{
    // GET /schools/{school}/sections
    public function index(School $school)
    {
        $this->authorize('viewAny', Section::class);

        $user = Auth::user();

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $schoolCourseIds = Course::whereIn('department_id', $schoolDepartmentIds)->pluck('id');

        // Get sections for these courses with necessary relationships
        $sections = Section::whereIn('course_id', $schoolCourseIds)
            ->with([
                'course.department', 
                'term', 
                'professor', 
                'schedules.room.floor.building', 
                'requiredFeatures',
                'courseRegistrations'
            ])
            ->get();

        return Inertia::render('Sections/Index', [
            'sections' => $sections,
            'school' => $school,
            'statuses' => [
                Section::STATUS_ACTIVE,
                Section::STATUS_CANCELED,
                Section::STATUS_FULL,
                Section::STATUS_PENDING,
            ],
            'deliveryMethods' => [
                Section::DELIVERY_IN_PERSON,
                Section::DELIVERY_ONLINE,
                Section::DELIVERY_HYBRID,
            ],
        ]);
    }

    // GET /schools/{school}/sections/create
    public function create(School $school)
    {
        $this->authorize('create', Section::class);

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $courses = Course::whereIn('department_id', $schoolDepartmentIds)->get();

        // Get terms for this school
        $terms = Term::where('school_id', $school->id)->get();

        // Get professors who are in this school with role 'professor'
        $professors = User::where('school_id', $school->id)
            ->whereHas('role', function($q) {
                $q->where('name', 'professor');
            })
            ->get();

        // Get room features
        $roomFeatures = RoomFeature::all();

        // Get rooms
        $rooms = Room::with('floor.building')->get();

        return Inertia::render('Sections/Create', [
            'courses' => $courses,
            'terms' => $terms,
            'professors' => $professors,
            'roomFeatures' => $roomFeatures,
            'rooms' => $rooms,
            'school' => $school,
            'statuses' => [
                Section::STATUS_ACTIVE,
                Section::STATUS_CANCELED,
                Section::STATUS_FULL,
                Section::STATUS_PENDING,
            ],
            'deliveryMethods' => [
                Section::DELIVERY_IN_PERSON,
                Section::DELIVERY_ONLINE,
                Section::DELIVERY_HYBRID,
            ],
            'meetingPatterns' => [
                'single' => 'Single Meeting',
                'weekly' => 'Weekly',
                'monday-wednesday-friday' => 'Monday/Wednesday/Friday',
                'tuesday-thursday' => 'Tuesday/Thursday',
                'monday-wednesday' => 'Monday/Wednesday',
                'tuesday-friday' => 'Tuesday/Friday',
            ],
            'locationTypes' => [
                'in-person' => 'In Person',
                'virtual' => 'Virtual',
                'hybrid' => 'Hybrid',
            ],
        ]);
    }

    // POST /schools/{school}/sections
    public function store(Request $request, School $school)
    {
        $this->authorize('create', Section::class);

        // Validate course belongs to this school
        $course = Course::findOrFail($request->course_id);
        $department = Department::findOrFail($course->department_id);

        if ($department->school_id !== $school->id) {
            return back()->withErrors(['course_id' => 'Selected course does not belong to this school']);
        }

        // Validate term belongs to this school
        $term = Term::findOrFail($request->term_id);
        if ($term->school_id !== $school->id) {
            return back()->withErrors(['term_id' => 'Selected term does not belong to this school']);
        }

        // Begin transaction to ensure section and schedules are created together
        DB::beginTransaction();

        try {
            $data = $request->validate([
                'course_id'          => 'required|exists:courses,id',
                'term_id'            => 'required|exists:terms,id',
                'professor_id'       => 'nullable|exists:users,id',
                'section_code'       => 'required|string|max:10',
                'number_of_students' => 'required|integer|min:0',
                'status'             => 'required|string|in:active,canceled,full,pending',
                'delivery_method'    => 'required|string|in:in-person,online,hybrid',
                'notes'              => 'nullable|string',
            ]);

            $section = Section::create($data);

            if ($request->has('required_features')) {
                $section->requiredFeatures()->sync($request->required_features);
            }

            // Handle schedules if they were submitted (optional)
            if ($request->has('schedules') && is_array($request->schedules) && count($request->schedules) > 0) {
                foreach ($request->schedules as $scheduleData) {
                    // Validate schedule data
                    $validatedSchedule = $this->validateScheduleData($scheduleData);
                    
                    // Create schedule
                    $section->schedules()->create($validatedSchedule);
                }
            }

            DB::commit();
            
            return redirect()
                ->route('sections.show', ['school' => $school, 'section' => $section->id])
                ->with('success', 'Section created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Error creating section: ' . $e->getMessage()]);
        }
    }

    // GET /schools/{school}/sections/{section}
    public function show(School $school, $section)
    {
        $section = Section::with([
            'course.department', 
            'term', 
            'professor', 
            'schedules.room.floor.building', 
            'requiredFeatures',
            'courseRegistrations.student'
        ])->findOrFail($section);

        $this->authorize('view', $section);

        // Verify section belongs to this school
        $course = $section->course;
        if (!$course) {
            abort(404, 'Section not found');
        }

        $department = $course->department;
        if (!$department || $department->school_id !== $school->id) {
            abort(403, 'This section does not belong to your school');
        }

        return Inertia::render('Sections/Show', [
            'section' => $section,
            'school' => $school
        ]);
    }

    // GET /schools/{school}/sections/{section}/edit
    public function edit(School $school, $section)
    {
        $section = Section::findOrFail($section);
        $this->authorize('update', $section);

        // Verify section belongs to this school
        $course = $section->course;
        if (!$course) {
            abort(404, 'Section not found');
        }

        $department = $course->department;
        if (!$department || $department->school_id !== $school->id) {
            abort(403, 'This section does not belong to your school');
        }

        $section->load(['course', 'term', 'professor', 'schedules.room', 'requiredFeatures']);

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $courses = Course::whereIn('department_id', $schoolDepartmentIds)->get();

        // Get terms for this school
        $terms = Term::where('school_id', $school->id)->get();

        // Get professors who are in this school with role 'professor'
        $professors = User::where('school_id', $school->id)
            ->whereHas('role', function($q) {
                $q->where('name', 'professor');
            })
            ->get();

        // Get room features
        $roomFeatures = RoomFeature::all();

        // Get rooms
        $rooms = Room::with('floor.building')
            ->whereHas('floor.building', function($query) use ($school) {
                $query->where('school_id', $school->id);
            })
            ->get();

        return Inertia::render('Sections/Edit', [
            'section' => $section,
            'courses' => $courses,
            'terms' => $terms,
            'professors' => $professors,
            'roomFeatures' => $roomFeatures,
            'rooms' => $rooms,
            'school' => $school,
            'statuses' => [
                Section::STATUS_ACTIVE,
                Section::STATUS_CANCELED,
                Section::STATUS_FULL,
                Section::STATUS_PENDING,
            ],
            'deliveryMethods' => [
                Section::DELIVERY_IN_PERSON,
                Section::DELIVERY_ONLINE,
                Section::DELIVERY_HYBRID,
            ],
            'meetingPatterns' => [
                'single' => 'Single Meeting',
                'weekly' => 'Weekly',
                'monday-wednesday-friday' => 'Monday/Wednesday/Friday',
                'tuesday-thursday' => 'Tuesday/Thursday',
                'monday-wednesday' => 'Monday/Wednesday',
                'tuesday-friday' => 'Tuesday/Friday',
            ],
            'locationTypes' => [
                'in-person' => 'In Person',
                'virtual' => 'Virtual',
                'hybrid' => 'Hybrid',
            ],
        ]);
    }

    // PUT /schools/{school}/sections/{section}
    public function update(Request $request, School $school, $section)
    {
        $section = Section::findOrFail($section);
        $this->authorize('update', $section);

        // Verify section belongs to this school
        $currentCourse = $section->course;
        if (!$currentCourse) {
            abort(404, 'Section not found');
        }

        $currentDepartment = $currentCourse->department;
        if (!$currentDepartment || $currentDepartment->school_id !== $school->id) {
            abort(403, 'This section does not belong to your school');
        }

        // Validate new course belongs to this school
        if ($request->course_id != $section->course_id) {
            $newCourse = Course::findOrFail($request->course_id);
            $newDepartment = Department::findOrFail($newCourse->department_id);

            if ($newDepartment->school_id !== $school->id) {
                return back()->withErrors(['course_id' => 'Selected course does not belong to this school']);
            }
        }

        // Validate new term belongs to this school
        if ($request->term_id != $section->term_id) {
            $newTerm = Term::findOrFail($request->term_id);
            if ($newTerm->school_id !== $school->id) {
                return back()->withErrors(['term_id' => 'Selected term does not belong to this school']);
            }
        }

        // Begin transaction to ensure section and schedules are updated together
        DB::beginTransaction();

        try {
            $data = $request->validate([
                'course_id'          => 'required|exists:courses,id',
                'term_id'            => 'required|exists:terms,id',
                'professor_id'       => 'nullable|exists:users,id',
                'section_code'       => 'required|string|max:10',
                'number_of_students' => 'required|integer|min:0',
                'status'             => 'required|string|in:active,canceled,full,pending',
                'delivery_method'    => 'required|string|in:in-person,online,hybrid',
                'notes'              => 'nullable|string',
            ]);

            $section->update($data);

            if ($request->has('required_features')) {
                $section->requiredFeatures()->sync($request->required_features);
            }

            // Handle schedules if they were submitted
            if ($request->has('schedules')) {
                // Delete existing schedules and create new ones
                $section->schedules()->delete();
                
                foreach ($request->schedules as $scheduleData) {
                    // Validate schedule data
                    $validatedSchedule = $this->validateScheduleData($scheduleData);
                    
                    // Create schedule
                    $section->schedules()->create($validatedSchedule);
                }
            }

            DB::commit();
            
            return redirect()
                ->route('sections.show', ['school' => $school, 'section' => $section->id])
                ->with('success', 'Section updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Error updating section: ' . $e->getMessage()]);
        }
    }

    // DELETE /schools/{school}/sections/{section}
    public function destroy(School $school, $section)
    {
        $section = Section::findOrFail($section);
        $this->authorize('delete', $section);

        // Verify section belongs to this school
        $course = $section->course;
        if (!$course) {
            abort(404, 'Section not found');
        }

        $department = $course->department;
        if (!$department || $department->school_id !== $school->id) {
            abort(403, 'This section does not belong to your school');
        }

        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Delete schedules
            $section->schedules()->delete();
            
            // Delete section
            $section->delete();
            
            DB::commit();
            return redirect()->route('sections.index', ['school' => $school])->with('success', 'Section deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Error deleting section: ' . $e->getMessage()]);
        }
    }

    /**
     * Validate schedule data
     * 
     * @param array $scheduleData
     * @return array
     */
    private function validateScheduleData($scheduleData)
    {
        return [
            'room_id' => $scheduleData['room_id'] ?? null,
            'day_of_week' => $scheduleData['day_of_week'] ?? 'Monday',
            'start_time' => $scheduleData['start_time'],
            'end_time' => $scheduleData['end_time'],
            'meeting_pattern' => $scheduleData['meeting_pattern'] ?? 'single',
            'location_type' => $scheduleData['location_type'] ?? 'in-person',
            'virtual_meeting_url' => $scheduleData['virtual_meeting_url'] ?? null,
        ];
    }

    // GET /schools/{school}/sections/calendar
    public function calendar(School $school)
    {
        $this->authorize('viewAny', Section::class);

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $schoolCourseIds = Course::whereIn('department_id', $schoolDepartmentIds)->pluck('id');

        // Get sections for these courses with their schedules
        $sections = Section::whereIn('course_id', $schoolCourseIds)
            ->with(['course', 'term', 'professor', 'schedules.room.floor.building'])
            ->get();

        // Format the calendar events
        $calendarEvents = [];
        
        foreach ($sections as $section) {
            foreach ($section->schedules as $schedule) {
                // For each schedule, create an event for each day of the week
                foreach ($schedule->daysOfWeek as $day) {
                    $calendarEvents[] = [
                        'id' => $schedule->id . '-' . $day,
                        'title' => $section->course->course_code . ' - ' . $section->section_code,
                        'description' => $section->course->title,
                        'start' => $day . ' ' . $schedule->start_time,
                        'end' => $day . ' ' . $schedule->end_time,
                        'resourceId' => $schedule->room_id ?? 'unassigned',
                        'extendedProps' => [
                            'section_id' => $section->id,
                            'school_id' => $school->id,
                            'professor' => $section->professor ? $section->professor->name : 'Unassigned',
                            'room' => $schedule->room ? $schedule->room->room_number . ' (' . $schedule->room->floor->building->name . ')' : 'Unassigned',
                            'term' => $section->term->name,
                            'status' => $section->status,
                            'delivery_method' => $section->delivery_method,
                        ]
                    ];
                }
            }
        }

        // Get rooms for resources
        $rooms = Room::with('floor.building')
            ->whereHas('floor.building', function($query) use ($school) {
                $query->where('school_id', $school->id);
            })
            ->get()
            ->map(function($room) {
                return [
                    'id' => $room->id,
                    'title' => $room->room_number . ' (' . $room->floor->building->name . ')',
                    'building' => $room->floor->building->name,
                    'capacity' => $room->capacity,
                ];
            });

        // Add "Unassigned" resource
        $resources = array_merge([
            [
                'id' => 'unassigned',
                'title' => 'Unassigned',
                'building' => 'N/A',
                'capacity' => 0,
            ]
        ], $rooms->toArray());

        return Inertia::render('Sections/Calendar', [
            'calendarEvents' => $calendarEvents,
            'resources' => $resources,
            'school' => $school,
        ]);
    }
}
