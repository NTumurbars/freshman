<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Section;
use Illuminate\Auth\Access\HandlesAuthorization;

class SectionPolicy
{
    use HandlesAuthorization;

    /**
     * All authenticated users can view sections.
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * All authenticated users can view a section.
     */
    public function view(User $user, Section $section)
    {
        return true;
    }

    /**
     * Super admin, school admin, and major coordinator can create sections.
     */
    public function create(User $user)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);
    }

    /**
     * Super admin, school admin, and major coordinator can update sections.
     */
    public function update(User $user, Section $section)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);
    }

    /**
     * Super admin, school admin, and major coordinator can delete sections.
     */
    public function delete(User $user, Section $section)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin', 'major_coordinator']);
    }
}
