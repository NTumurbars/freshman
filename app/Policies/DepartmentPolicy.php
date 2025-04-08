<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Department;
use Illuminate\Auth\Access\HandlesAuthorization;

class DepartmentPolicy
{
    use HandlesAuthorization;

    /**
     * Everyone can view departments, but we still need to scope results appropriately.
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Everyone can view a department, but we'll check school context for admins.
     */
    public function view(User $user, Department $department)
    {
        // Super admin can view any department
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only view departments in their school
        if ($user->role->name === 'school_admin') {
            return $user->school_id === $department->school_id;
        }

        return true;
    }

    /**
     * Only super admin and school admin (or major coordinator, if desired) can create a department.
     */
    public function create(User $user)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Only super admin and school admin can update a department.
     * School admins can only update departments in their own school.
     */
    public function update(User $user, Department $department)
    {
        if ($user->role->name === 'super_admin') {
            return true;
        }

        if ($user->role->name === 'school_admin') {
            return $user->school_id === $department->school_id;
        }

        return false;
    }

    /**
     * Only super admin and school admin can delete a department.
     * School admins can only delete departments in their own school.
     */
    public function delete(User $user, Department $department)
    {
        if ($user->role->name === 'super_admin') {
            return true;
        }

        if ($user->role->name === 'school_admin') {
            return $user->school_id === $department->school_id;
        }

        return false;
    }
}
