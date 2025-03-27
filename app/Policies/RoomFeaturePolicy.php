<?php

namespace App\Policies;

use App\Models\User;
use App\Models\RoomFeature;
use Illuminate\Auth\Access\HandlesAuthorization;

class RoomFeaturePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        // All authenticated users can view room features.
        return true;
    }

    public function view(User $user, RoomFeature $roomFeature)
    {
        return true;
    }

    public function create(User $user)
    {
        // Only super_admin and school_admin can create room features.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function update(User $user, RoomFeature $roomFeature)
    {
        // Only super_admin and school_admin can update room features.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function delete(User $user, RoomFeature $roomFeature)
    {
        // Only super_admin and school_admin can delete room features.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }
}
