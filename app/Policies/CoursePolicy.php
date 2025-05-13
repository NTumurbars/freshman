<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Auth\Access\HandlesAuthorization;

class CoursePolicy
{
    use HandlesAuthorization;

    /**
     * All authenticated users can view courses.
     */
    public function viewAny(User $user)
    {
        return true;
    }

    /**
     * All authenticated users can view a course.
     */
    public function view(User $user, Course $course)
    {
        // Super admin can view any course
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only view courses for their school
        if ($user->role->name === 'school_admin') {
            // Get department IDs that belong to the user's school
            $schoolDepartmentIds = Department::where('school_id', $user->school_id)->pluck('id');

            // Check if the course belongs to the user's school
            return $schoolDepartmentIds->contains($course->department_id);
        }

        return true;
    }

    /**
     * Only super admin and school admin can create courses.
     */
    public function create(User $user)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Only super admin and school admin can update courses.
     */
    public function update(User $user, Course $course)
    {
        // Super admin can update any course
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only update courses for their school
        if ($user->role->name === 'school_admin') {
            // Get department IDs that belong to the user's school
            $schoolDepartmentIds = Department::where('school_id', $user->school_id)->pluck('id');

            // Check if the course belongs to the user's school
            return $schoolDepartmentIds->contains($course->department_id);
        }

        if($user->role->id === 3)
        {
            return Department::with('courses')->findOrFail($user->professor_profile->department_id);
        }

        return false;
    }

    /**
     * Only super admin and school admin can delete courses.
     */
    public function delete(User $user, Course $course)
    {
        // Super admin can delete any course
        if ($user->role->name === 'super_admin') {
            return true;
        }

        // School admins can only delete courses for their school
        if ($user->role->name === 'school_admin') {
            // Get department IDs that belong to the user's school
            $schoolDepartmentIds = Department::where('school_id', $user->school_id)->pluck('id');

            // Check if the course belongs to the user's school
            return $schoolDepartmentIds->contains($course->department_id);
        }

        if($user->role->id === 3)
        {
            return Department::with('courses')->findOrFail($user->professor_profile->department_id);
        }

        return false;
    }
}
