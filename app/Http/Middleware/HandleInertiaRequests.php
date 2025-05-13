<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Term;
use App\Models\School;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Merge whatever the parent class shares by default.
        // Then override or add your own keys (e.g. 'auth') as needed.
        return array_merge(parent::share($request), [
            'auth' => [
                // This arrow function only gets called if the user is logged in,
                // returning null if not.
                'user' => fn () => $request->user()
                    ? $this->transformUser($request->user())
                    : null,
                'can' => fn () => $request->user()
                    ? $this->getPermissions($request->user())
                    : null,
            ],
        ]);
    }

    /**
     * If the user is logged in, load role and school, then return a custom array.
     */
    protected function transformUser($user): array
    {
        // Eager load the relations you want.
        $user->load([
            'role',
            'school',
            'courseRegistrations' => function($query) {
                $query->whereHas('section.term', function($q) {
                    $q->where('start_date', '<=', now())
                      ->where('end_date', '>=', now());
                });
            },
            'courseRegistrations.section.course',
            'courseRegistrations.section.schedules.room.floor.building',
            'courseRegistrations.section.professor_profile.user'
        ]);

        // Get current term for the user's school
        $currentTerm = null;
        if ($user->school_id) {
            $currentTerm = Term::where('school_id', $user->school_id)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->first();
        }

        return [
            'id'       => $user->id,
            'name'     => $user->name,
            'email'    => $user->email,
            // If your users table has a 'school_id' column and possibly a 'school' relation:
            'school_id' => $user->school_id,
            'school'    => $user->school ? [
                'id'    => $user->school->id,
                'name'  => $user->school->name,
                'logo_url' => $user->school->logo_url,
            ] : null,

            // Role
            'role' => $user->role ? [
                'id'   => $user->role->id,
                'name' => $user->role->name,
            ] : null,
            'registrations' => $user->role && $user->role->name === 'student'
                ? $user->courseRegistrations->map(function($registration) {
                    if (!$registration->section) {
                        return null;
                    }

                    // Ensure section exists and has required properties
                    $section = $registration->section;
                    if (!$section->course) {
                        return null;
                    }

                    return [
                        'id' => $registration->id,
                        'section' => [
                            'id' => $section->id,
                            'section_code' => $section->section_code,
                            'delivery_method' => $section->delivery_method,
                            'course' => [
                                'id' => $section->course->id,
                                'code' => $section->course->code,
                                'title' => $section->course->title,
                                'credits' => $section->course->credits ?? 0,
                            ],
                            'professor_profile' => $section->professor_profile
                                ? [
                                    'id' => $section->professor_profile->id,
                                    'user' => $section->professor_profile->user
                                        ? [
                                            'id' => $section->professor_profile->user->id,
                                            'name' => $section->professor_profile->user->name,
                                        ]
                                        : null,
                                ]
                                : null,
                            'schedules' => $section->schedules
                                ? $section->schedules->map(function($schedule) {
                                    if (!$schedule) return null;

                                    return [
                                        'id' => $schedule->id,
                                        'day_of_week' => $schedule->day_of_week,
                                        'start_time' => $schedule->start_time,
                                        'end_time' => $schedule->end_time,
                                        'room' => $schedule->room
                                            ? [
                                                'id' => $schedule->room->id,
                                                'room_number' => $schedule->room->room_number,
                                                'floor' => $schedule->room->floor
                                                    ? [
                                                        'building' => $schedule->room->floor->building
                                                            ? $schedule->room->floor->building->name
                                                            : null,
                                                    ]
                                                    : null,
                                            ]
                                            : null,
                                    ];
                                })->filter()->values() // Remove nulls and reindex
                                : [],
                        ],
                    ];
                })->filter()->values() // Remove nulls and reindex
                : [],
            'current_term' => $currentTerm ? [
                'id' => $currentTerm->id,
                'name' => $currentTerm->name,
                'start_date' => $currentTerm->start_date,
                'end_date' => $currentTerm->end_date,
            ] : null,
        ];
    }

    /**
     * Get user permissions based on their role
     */
    protected function getPermissions($user): array
    {
        $permissions = [];

        // Term permissions
        $permissions['create_term'] = $user->can('create', Term::class);
        $permissions['update_term'] = $user->role->name === 'super_admin'
            || $user->role->name === 'school_admin';
        $permissions['delete_term'] = $user->role->name === 'super_admin'
            || $user->role->name === 'school_admin';

        // School permissions
        $permissions['create_school'] = $user->role->name === 'super_admin';
        $permissions['update_school'] = $user->role->name === 'super_admin'
            || ($user->role->name === 'school_admin' && $user->school_id);

        // Schedule permissions
        $permissions['create_schedule'] = $user->can('create', \App\Models\Schedule::class);
        $permissions['update_schedule'] = in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);
        $permissions['delete_schedule'] = in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);

        // Section permissions
        $permissions['create_section'] = $user->can('create', \App\Models\Section::class);
        $permissions['update_section'] = in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);
        $permissions['delete_section'] = in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);

        return $permissions;
    }
}
