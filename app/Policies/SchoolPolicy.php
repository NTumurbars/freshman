<?php

namespace App\Policies;

use App\Models\User;
use App\Models\School;
use Illuminate\Auth\Access\HandlesAuthorization;

class SchoolPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any schools.
     * Super admin and school admin can view schools.
     */
    public function viewAny(User $user)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Determine whether the user can view the school.
     * Super admin can view all; school admin can view only their own school.
     */
    public function view(User $user, School $school)
    {
        return $user->role->name === 'super_admin' || $user->school_id === $school->id;
    }

    /**
     * Determine whether the user can create schools.
     * Only super admin can create a school.
     */
    public function create(User $user)
    {
        return $user->role->name === 'super_admin';
    }

    /**
     * Determine whether the user can update the school.
     * Super admin can update any school.
     * School admin can update their own school.
     */
    public function update(User $user, School $school)
    {
        if ($user->role->name === 'super_admin') {
            return true;
        }

        if ($user->role->name === 'school_admin' && $user->school_id === $school->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the school.
     * Only super admin can delete schools.
     */
    public function delete(User $user, School $school)
    {
        return $user->role->name === 'super_admin';
    }
}
