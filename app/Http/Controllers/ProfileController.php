<?php

namespace App\Http\Controllers;

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
        return Inertia::render('Profile/Show', [
            'user' => $request->user()->only('id', 'name', 'email', 'created_at'),
            'status' => session('status'),
        ]);
    }
    
    /**
     * Display the edit form.
     */
    public function edit(Request $request)
    {
        return Inertia::render('Profile/Edit', [
            'user' => $request->user()->only('id', 'name', 'email'),
        ]);
    }

    /**
     * Handle the profile update request.
     */
    public function update(Request $request)
    {
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

        return Redirect::route('profile.show')->with('status', 'Profile updated successfully!');
    }
}
