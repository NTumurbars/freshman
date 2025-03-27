<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any users.
     * Super admin sees all; school admin sees only users within their school.
     */
    public function viewAny(User $user)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Determine whether the user can view a specific user.
     * Super admin can view any; school admin can view a user if they're in the same school;
     * a user can view themselves.
     */
    public function view(User $user, User $model)
    {
        return $user->id === $model->id ||
               $user->role->name === 'super_admin' ||
               ($user->role->name === 'school_admin' && $user->school_id === $model->school_id);
    }

    /**
     * Determine whether the user can create users.
     * Super admin and school admin can create users.
     */
    public function create(User $user)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Determine whether the user can update a user.
     * Super admin can update any; school admin can update users in their school.
     */
    public function update(User $user, User $model)
    {
        return $user->role->name === 'super_admin' ||
               ($user->role->name === 'school_admin' && $user->school_id === $model->school_id);
    }

    /**
     * Determine whether the user can delete a user.
     * Typically only super admin can delete users.
     */
    public function delete(User $user, User $model)
    {
        return $user->role->name === 'super_admin';
    }
}
