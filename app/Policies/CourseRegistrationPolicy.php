<?php

namespace App\Policies;

use App\Models\User;
use App\Models\CourseRegistration;
use Illuminate\Auth\Access\HandlesAuthorization;

class CourseRegistrationPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        // Super admin and school admin can view all registrations.
        // Students can view only their own registrations.
        return in_array($user->role->name, ['super_admin', 'school_admin', 'student']);
    }

    public function view(User $user, CourseRegistration $registration)
    {
        // Allow if the user is super_admin or school_admin,
        // or if the registration belongs to the student.
        return $user->role->name === 'super_admin' ||
               $user->role->name === 'school_admin' ||
               $user->id === $registration->student_id;
    }

    public function create(User $user)
    {
        // Allow students to create their own registration; 
        // super_admin and school_admin can create for others.
        return in_array($user->role->name, ['super_admin', 'school_admin', 'student']);
    }

    public function update(User $user, CourseRegistration $registration)
    {
        // Only super_admin or school_admin can update registrations.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }

    public function delete(User $user, CourseRegistration $registration)
    {
        // Only super_admin or school_admin can delete registrations.
        return in_array($user->role->name, ['super_admin', 'school_admin']);
    }
}
