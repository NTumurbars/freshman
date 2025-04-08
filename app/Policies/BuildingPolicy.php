<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Building;
use Illuminate\Auth\Access\HandlesAuthorization;

class BuildingPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any buildings.
     * Everyone can view buildings, but results will be scoped to the user's school in the controller.
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view a building.
     */
    public function view(User $user, Building $building)
    {
        // Super admin can view any building
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only view buildings in their school
        if ($user->role->name === 'school_admin') {
            return $user->school_id === $building->school_id;
        }

        // Everyone else can view buildings in their school
        return $user->school_id === $building->school_id;
    }

    /**
     * Determine whether the user can create buildings.
     * Only super admin and school admin can create buildings.
     */
    public function create(User $user)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Determine whether the user can update a building.
     */
    public function update(User $user, Building $building)
    {
        // Super admin can update any building
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only update buildings in their school
        if ($user->role->name === 'school_admin') {
            return $user->school_id === $building->school_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete a building.
     */
    public function delete(User $user, Building $building)
    {
        // Super admin can delete any building
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only delete buildings in their school
        if ($user->role->name === 'school_admin') {
            return $user->school_id === $building->school_id;
        }

        return false;
    }
}
