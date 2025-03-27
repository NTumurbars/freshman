<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Course;
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
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    /**
     * Only super admin and school admin can delete courses.
     */
    public function delete(User $user, Course $course)
    {
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }
}
