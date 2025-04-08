<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Room;
use Illuminate\Auth\Access\HandlesAuthorization;

class RoomPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        // All authenticated users can view rooms.
        return true;
    }

    public function view(User $user, Room $room)
    {
        // Super admin can view any room
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only view rooms in their school
        if ($user->role->name === 'school_admin') {
            return $user->school_id === $room->floor->building->school_id;
        }

        return true;
    }

    public function create(User $user)
    {
        // Only super_admin and school_admin can create rooms.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function update(User $user, Room $room)
    {
        // Super admin can update any room
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only update rooms in their school
        if ($user->role->name === 'school_admin') {
            return $user->school_id === $room->floor->building->school_id;
        }

        return false;
    }

    public function delete(User $user, Room $room)
    {
        // Super admin can delete any room
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only delete rooms in their school
        if ($user->role->name === 'school_admin') {
            return $user->school_id === $room->floor->building->school_id;
        }

        return false;
    }
}
