<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ProfessorProfile;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProfessorProfilePolicy
{
    use HandlesAuthorization;

    /**
     * A professor can view their own profile.
     * School admin or super admin can view any professor profile.
     */
    public function view(User $user, ProfessorProfile $profile)
    {
        return $user->id === $profile->user_id ||
               in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * A professor can update their own profile.
     * School admin or super admin can update any professor profile.
     */
    public function update(User $user, ProfessorProfile $profile)
    {
        return $user->id === $profile->user_id ||
               in_array($user->role->name, ['super_admin', 'school_admin']);
    }
}
