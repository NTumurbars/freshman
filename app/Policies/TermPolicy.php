<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Term;
use Illuminate\Auth\Access\HandlesAuthorization;

class TermPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Term $term)
    {
        return true;
    }

    public function create(User $user)
    {
        // Only super_admin and school_admin can create terms.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function update(User $user, Term $term)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function delete(User $user, Term $term)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }
}
