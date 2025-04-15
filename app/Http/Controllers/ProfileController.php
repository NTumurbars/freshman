<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\ProfessorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ProfileController extends Controller
{
    /**
     * Display the user's profile info.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $data = [
            'user' => $user->only('id', 'name', 'email', 'created_at', 'role_id'),
            'status' => session('status'),
        ];

        // Make sure role is loaded
        $user->load('role');
        $data['user']['role'] = [
            'id' => $user->role->id,
            'name' => $user->role->name
        ];

        // Add professor profile data if the user is a professor
        if ($user->role->name === 'professor' || $user->role->name === 'major_coordinator') {
            $professorProfile = $user->professor_profile;
            if ($professorProfile) {
                $professorProfile->load('department');
                $data['professorProfile'] = $professorProfile;
                $data['user']['professor_profile'] = $professorProfile;
            } else {
                $data['user']['professor_profile'] = null;
            }
        }

        return Inertia::render('Profile/Show', $data);
    }

    /**
     * Display the edit form.
     */
    public function edit(Request $request)
    {
        $user = $request->user();
        $user->load('role');

        $data = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => [
                    'id' => $user->role->id,
                    'name' => $user->role->name
                ]
            ],
        ];

        // Add professor profile data if the user is a professor
        if ($user->role->name === 'professor' || $user->role->name === 'major_coordinator') {
            $professorProfile = $user->professor_profile;
            if ($professorProfile) {
                $professorProfile->load('department');
                $data['professorProfile'] = $professorProfile;
                $data['user']['professor_profile'] = $professorProfile;
            } else {
                $data['professorProfile'] = null;
                $data['user']['professor_profile'] = null;
            }

            // Include departments for the dropdown
            $departments = Department::where('school_id', $user->school_id)->get();
            $data['departments'] = $departments;
        }

        return Inertia::render('Profile/Edit', $data);
    }

    /**
     * Handle the profile update request.
     */
    public function update(Request $request)
    {
        // Basic validation for user info
        $request->validate([
            'name' => 'required|string|max:255',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $request->user();
        $user->name = $request->name;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        // Handle professor profile updates if the user is a professor
        if (($user->role->name === 'professor' || $user->role->name === 'major_coordinator') && $request->has('professorProfile')) {
            $professorProfileData = $request->validate([
                'professorProfile.department_id' => 'required|exists:departments,id',
                'professorProfile.title' => 'nullable|string|max:255',
                'professorProfile.office' => 'nullable|string|max:255',
                'professorProfile.phone' => 'nullable|string|max:30',
                'professorProfile.website' => 'nullable|string|max:255',
            ]);

            // Get or create professor profile
            $professorProfile = $user->professor_profile;

            if ($professorProfile) {
                $professorProfile->update([
                    'department_id' => $professorProfileData['professorProfile']['department_id'],
                    'title' => $professorProfileData['professorProfile']['title'] ?? null,
                    'office' => $professorProfileData['professorProfile']['office'] ?? null,
                    'phone' => $professorProfileData['professorProfile']['phone'] ?? null,
                    'website' => $professorProfileData['professorProfile']['website'] ?? null,
                ]);
            } else {
                // Create a new professor profile
                $user->professor_profile()->create([
                    'department_id' => $professorProfileData['professorProfile']['department_id'],
                    'title' => $professorProfileData['professorProfile']['title'] ?? null,
                    'office' => $professorProfileData['professorProfile']['office'] ?? null,
                    'phone' => $professorProfileData['professorProfile']['phone'] ?? null,
                    'website' => $professorProfileData['professorProfile']['website'] ?? null,
                ]);
            }
        }

        return Redirect::route('profile.show')->with('status', 'Profile updated successfully!');
    }
}
