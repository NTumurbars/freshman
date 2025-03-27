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
        return true;
    }

    public function create(User $user)
    {
        // Only super_admin and school_admin can create rooms.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function update(User $user, Room $room)
    {
        // Only super_admin and school_admin can update rooms.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function delete(User $user, Room $room)
    {
        // Only super_admin and school_admin can delete rooms.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }
}
