<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Section;
use App\Models\Department;
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
     * School admins can view sections in their own school.
     */
    public function view(User $user, Section $section)
    {
        // Super admin can view any section
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only view sections in their school
        if ($user->role->name === 'school_admin') {
            // Get the course, then its department, then check the school
            $course = $section->course;
            if (!$course) return false;

            $department = $course->department;
            if (!$department) return false;

            return $user->school_id === $department->school_id;
        }

        return true;
    }

    /**
     * Super admin, school admin, and major coordinator can create sections.
     */
    public function create(User $user)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Super admin, school admin, and major coordinator can update sections.
     * School admins and major coordinators can only update sections in their own school.
     */
    public function update(User $user, Section $section)
    {
        // Super admin can update any section
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins and major coordinators can only update sections in their school
        if (in_array($user->role->name, ['school_admin', 'major_coordinator'])) {
            // Get the course, then its department, then check the school
            $course = $section->course;
            if (!$course) return false;

            $department = $course->department;
            if (!$department) return false;

            return $user->school_id === $department->school_id;
        }

        return false;
    }

    /**
     * Super admin, school admin, and major coordinator can delete sections.
     * School admins and major coordinators can only delete sections in their own school.
     */
    public function delete(User $user, Section $section)
    {
        // Super admin can delete any section
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins and major coordinators can only delete sections in their school
        if (in_array($user->role->name, ['school_admin', 'major_coordinator'])) {
            // Get the course, then its department, then check the school
            $course = $section->course;
            if (!$course) return false;

            $department = $course->department;
            if (!$department) return false;

            return $user->school_id === $department->school_id;
        }

        return false;
    }
}
