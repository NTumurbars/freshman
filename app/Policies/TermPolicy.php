<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Term;
use Illuminate\Auth\Access\HandlesAuthorization;

class TermPolicy
{
    use HandlesAuthorization;

    /**
     * Everyone can view terms, but they should be scoped to the user's school.
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can view a specific term.
     */
    public function view(User $user, Term $term)
    {
        // Super admin can view any term
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins and other users can only view terms in their school
        return $user->school_id === $term->school_id;
    }

    /**
     * Determine whether the user can create terms.
     * Only super admins and school admins can create terms.
     */
    public function create(User $user)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Determine whether the user can update a term.
     */
    public function update(User $user, Term $term)
    {
        // Super admin can update any term
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only update terms in their school
        if ($user->role->name === 'school_admin') {
            return $user->school_id === $term->school_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete a term.
     */
    public function delete(User $user, Term $term)
    {
        // Super admin can delete any term
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only delete terms in their school
        if ($user->role->name === 'school_admin') {
            return $user->school_id === $term->school_id;
        }

        return false;
    }
}
