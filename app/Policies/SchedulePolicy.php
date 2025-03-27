<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Schedule;
use Illuminate\Auth\Access\HandlesAuthorization;

class SchedulePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        // All authenticated users can view schedules.
        return true;
    }

    public function view(User $user, Schedule $schedule)
    {
        return true;
    }

    public function create(User $user)
    {
        // Only super_admin, school_admin, and major_coordinator can create schedules.
        return in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);
    }

    public function update(User $user, Schedule $schedule)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);
    }

    public function delete(User $user, Schedule $schedule)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);
    }
}
