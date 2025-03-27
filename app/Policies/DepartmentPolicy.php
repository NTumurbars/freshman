<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Department;
use Illuminate\Auth\Access\HandlesAuthorization;

class DepartmentPolicy
{
    use HandlesAuthorization;

    /**
     * Everyone can view departments.
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Everyone can view a department.
     */
    public function view(User $user, Department $department)
    {
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
     */
    public function update(User $user, Department $department)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Only super admin and school admin can delete a department.
     */
    public function delete(User $user, Department $department)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }
}
