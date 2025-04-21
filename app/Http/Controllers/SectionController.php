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
use Illuminate\Support\Facades\Log;

// We need to add the show method for this class
// GET|HEAD show schools/{school}/sections/{section}
class SectionController extends Controller
{
    // GET /schools/{school}/sections
    public function index(School $school)
    {
        $this->authorize('viewAny', Section::class);

        $user = Auth::user();
        $isProfessor = $user->role->name === 'professor' || $user->role->name === 'major_coordinator';

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $schoolCourseIds = Course::whereIn('department_id', $schoolDepartmentIds)->pluck('id');

        // Base query for sections
        $sectionsQuery = Section::whereIn('course_id', $schoolCourseIds)
            ->with([
                'course.department',
                'term',
                'professor_profile.user',
                'schedules.room.floor.building',
                'requiredFeatures',
                'courseRegistrations'
            ]);

        // If user is a professor, include a flag to identify their own sections
        if ($isProfessor && $user->professor_profile) {
            $professorSections = clone $sectionsQuery;
            $professorSections = $professorSections->where('professor_profile_id', $user->professor_profile->id)->get();

            // Get all sections for context but mark the professor's own sections
            $allSections = $sectionsQuery->get();

            // Add a flag to mark sections taught by this professor
            $allSections->map(function($section) use ($user) {
                $section->is_teaching = $section->professor_profile_id === $user->professor_profile->id;
                return $section;
            });

            return Inertia::render('Sections/Index', [
                'sections' => $allSections,
                'professorSections' => $professorSections,
                'isProfessor' => true,
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

        // For non-professors, just return all sections
        $sections = $sectionsQuery->get();

        return Inertia::render('Sections/Index', [
            'sections' => $sections,
            'isProfessor' => false,
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

        // Get the active term for this school
        $activeTerm = Term::getActiveTerm($school);

        // Get all terms for this school
        $terms = Term::where('school_id', $school->id)->get();

        // Get professors who are in this school with role 'professor'
        $professorProfiles = ProfessorProfile::whereHas('user', function($q) use ($school) {
            $q->where('school_id', $school->id)
              ->whereHas('role', function($q) {
                  $q->where('name', 'professor');
              });
        })->with('user')->get();

        // Get room features
        $roomFeatures = RoomFeature::all();

        // Get rooms
        $rooms = Room::with('floor.building')->get();

        return Inertia::render('Sections/Create', [
            'courses' => $courses,
            'terms' => $terms,
            'activeTerm' => $activeTerm,
            'professorProfiles' => $professorProfiles,
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
                'professor_profile_id' => 'nullable|exists:professor_profiles,id',
                'section_code'       => 'required|string|max:10',
                'status'             => 'required|string|in:active,canceled,full,pending',
                'delivery_method'    => 'required|string|in:in-person,online,hybrid',
                'notes'              => 'nullable|string',
                'capacity'           => 'nullable|integer|min:1',
            ]);

            $section = Section::create($data);

            if ($request->has('required_features')) {
                $section->requiredFeatures()->sync($request->required_features);
            }

            // Handle schedules if they were submitted (optional)
            if ($request->has('schedules') && is_array($request->schedules) && count($request->schedules) > 0) {
                // Log the schedule data for debugging
                Log::info('Section creation - SCHEDULES DATA RECEIVED:', [
                    'schedules_count' => count($request->schedules),
                    'schedules_data' => $request->schedules
                ]);

                foreach ($request->schedules as $index => $scheduleData) {
                    // Log each schedule data
                    Log::info("Processing schedule #{$index}:", [
                        'has_room_id' => isset($scheduleData['room_id']),
                        'has_day_of_week' => isset($scheduleData['day_of_week']),
                        'has_start_time' => isset($scheduleData['start_time']),
                        'has_end_time' => isset($scheduleData['end_time']),
                        'has_meeting_pattern' => isset($scheduleData['meeting_pattern']),
                        'has_location_type' => isset($scheduleData['location_type']),
                        'has_virtual_meeting_url' => isset($scheduleData['virtual_meeting_url']),
                        'room_id' => $scheduleData['room_id'] ?? null,
                        'day_of_week' => $scheduleData['day_of_week'] ?? null,
                        'start_time' => $scheduleData['start_time'] ?? null,
                        'end_time' => $scheduleData['end_time'] ?? null,
                        'meeting_pattern' => $scheduleData['meeting_pattern'] ?? null,
                        'location_type' => $scheduleData['location_type'] ?? null,
                        'virtual_meeting_url' => $scheduleData['virtual_meeting_url'] ?? null,
                    ]);

                    try {
                        // Validate schedule data
                        $validatedSchedule = $this->validateScheduleData($scheduleData);

                        // Log successful validation
                        Log::info("Schedule #{$index} validation successful", $validatedSchedule);

                        // Create schedule
                        $section->schedules()->create($validatedSchedule);

                        Log::info("Schedule #{$index} created successfully");
                    } catch (\Exception $e) {
                        // Log validation failure
                        Log::error("Schedule #{$index} validation failed:", [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
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
            'professor_profile.user',
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

        // Log section data for debugging
        Log::info('Section data for frontend:', [
            'section_id' => $section->id,
            'has_course_registrations' => $section->courseRegistrations->count() > 0,
            'course_registrations_count' => $section->courseRegistrations->count(),
            'students_count' => $section->students_count,
        ]);

        return Inertia::render('Sections/Show', [
            'section' => array_merge($section->toArray(), [
                'courseRegistrations' => $section->courseRegistrations->map(function($registration) {
                    return [
                        'id' => $registration->id,
                        'student' => $registration->student ? [
                            'id' => $registration->student->id,
                            'name' => $registration->student->name,
                            'email' => $registration->student->email
                        ] : null
                    ];
                })
            ]),
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

        $section->load(['course', 'term', 'professor_profile.user', 'schedules.room', 'requiredFeatures']);

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $courses = Course::whereIn('department_id', $schoolDepartmentIds)->get();

        // Get terms for this school
        $terms = Term::where('school_id', $school->id)->get();

        // Get professors who are in this school with role 'professor'
        $professorProfiles = ProfessorProfile::whereHas('user', function($q) use ($school) {
            $q->where('school_id', $school->id)
              ->whereHas('role', function($q) {
                  $q->where('name', 'professor');
              });
        })->with('user')->get();

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
            'professorProfiles' => $professorProfiles,
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
                'professor_profile_id' => 'nullable|exists:professor_profiles,id',
                'section_code'       => 'required|string|max:10',
                'status'             => 'required|string|in:active,canceled,full,pending',
                'delivery_method'    => 'required|string|in:in-person,online,hybrid',
                'notes'              => 'nullable|string',
                'capacity'           => 'nullable|integer|min:1',
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
        Log::info('Validating schedule data:', [
            'received_data' => $scheduleData
        ]);

        $validator = validator($scheduleData, [
            'room_id' => 'nullable|exists:rooms,id',
            'day_of_week' => 'required|string',
            'start_time' => 'required|date_format:H:i:s,H:i',
            'end_time' => 'required|date_format:H:i:s,H:i|after:start_time',
            'meeting_pattern' => 'nullable|string',
            'location_type' => 'nullable|string',
            'virtual_meeting_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            Log::error('Schedule validation failed:', [
                'errors' => $validator->errors()->toArray()
            ]);
            throw new \Exception('Schedule validation failed: ' . json_encode($validator->errors()->toArray()));
        }

        return $validator->validate();
    }

    // GET /schools/{school}/sections/calendar
    public function calendar(School $school)
    {
        // Skip policy authorization for calendar view
        // $this->authorize('viewAny', Section::class);

        // Get the authenticated user
        $user = Auth::user();
        $isProfessor = $user->role->name === 'professor' || $user->role->name === 'major_coordinator';

        // If user is not a professor, redirect to another page or show an error
        if (!$isProfessor) {
            return redirect()->route('dashboard')->with('error', 'Access denied: This view is only for professors.');
        }

        // Get departments that belong to this school
        $schoolDepartmentIds = Department::where('school_id', $school->id)->pluck('id');

        // Get courses that belong to these departments
        $schoolCourseIds = Course::whereIn('department_id', $schoolDepartmentIds)->pluck('id');

        // Get professor profile
        $professorProfileId = ProfessorProfile::where('user_id', $user->id)->value('id');

        // Base query for sections - only show the professor's sections
        $sectionsQuery = Section::whereIn('course_id', $schoolCourseIds)
            ->with(['course', 'term', 'professor_profile.user', 'schedules.room.floor.building']);

        if ($professorProfileId) {
            $sectionsQuery = $sectionsQuery->where('professor_profile_id', $professorProfileId);
        } else {
            // If no professor profile, return empty data
            return Inertia::render('Sections/Calendar', [
                'calendarEvents' => [],
                'school' => $school,
                'isProfessor' => $isProfessor,
                'user' => $user
            ]);
        }

        // Get sections for this professor
        $sections = $sectionsQuery->get();

        // Format the calendar events
        $calendarEvents = [];

        foreach ($sections as $section) {
            foreach ($section->schedules as $schedule) {
                // For each schedule, create an event for each day of the week
                $dayOfWeek = $schedule->day_of_week; // Single day of week or array of days

                // Check if we have day_of_week property
                if (!$dayOfWeek) {
                    Log::warning('Schedule missing day_of_week', ['schedule_id' => $schedule->id]);
                    continue;
                }

                // Check if we're dealing with an array of days via daysOfWeek property or a single day
                $daysArray = property_exists($schedule, 'daysOfWeek') && is_array($schedule->daysOfWeek)
                    ? $schedule->daysOfWeek
                    : [$dayOfWeek];

                foreach ($daysArray as $day) {
                    $calendarEvents[] = [
                        'id' => $schedule->id . '-' . $day,
                        'title' => $section->course->code . ' - ' . $section->section_code,
                        'description' => $section->course->title,
                        'start' => $day . ' ' . $schedule->start_time,
                        'end' => $day . ' ' . $schedule->end_time,
                        'extendedProps' => [
                            'section_id' => $section->id,
                            'school_id' => $school->id,
                            'professor_profile' => $section->professor_profile ? [
                                'id' => $section->professor_profile->id,
                                'user' => [
                                    'id' => $section->professor_profile->user->id,
                                    'name' => $section->professor_profile->user->name,
                                ]
                            ] : null,
                            'room' => $schedule->room ? $schedule->room->room_number . ' (' . $schedule->room->floor->building->name . ')' : 'Unassigned',
                            'term' => $section->term->name,
                            'status' => $section->status,
                            'delivery_method' => $section->delivery_method,
                        ]
                    ];
                }
            }
        }

        return Inertia::render('Sections/Calendar', [
            'calendarEvents' => $calendarEvents,
            'school' => $school,
            'isProfessor' => $isProfessor,
            'user' => $user
        ]);
    }
}
