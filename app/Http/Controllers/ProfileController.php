<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the form for editing the user's profile.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
            'user' => [
                'name' => $request->user()->name,

                'email' => $request->user()->email,
            ],
        ]);
    }

    /**
     * Update the user's name or password.
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'password'              => 'nullable|string|min:8|confirmed',
            'password_confirmation' => 'required_with:password|same:password'
        ]);

        $user = $request->user();

        // Update name
        $user->name = $data['name'];

        // Update password only if provided
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully!');
    }
}
