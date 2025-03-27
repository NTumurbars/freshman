<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Major;
use Illuminate\Auth\Access\HandlesAuthorization;

class MajorPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        // All authenticated users can view majors.
        return true;
    }

    public function view(User $user, Major $major)
    {
        return true;
    }

    public function create(User $user)
    {
        // Only super_admin and school_admin can create majors.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function update(User $user, Major $major)
    {
        // Only super_admin and school_admin can update majors.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function delete(User $user, Major $major)
    {
        // Only super_admin and school_admin can delete majors.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }
}
