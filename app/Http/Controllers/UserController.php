<?php

namespace App\Http\Controllers;

use App\Jobs\UserWelcome;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Role;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    // GET /users
    public function index()
    {
        $users = User::with(['school', 'role', 'professorProfile'])->get();
        return Inertia::render('Users/Index', ['users' => $users]);
    }

    // GET /users/create
    public function create()
    {
        $roles = Role::all();
        $schools = School::all();
        return Inertia::render('Users/Create', [
            'roles' => $roles,
            'schools' => $schools,
        ]);
    }

    // POST /users
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string',
            'email'     => 'required|email|unique:users,email',
            'role_id'   => 'required|exists:roles,id',
            'school_id' => 'required|exists:schools,id',
        ]);

        $tempPassword = Str::random(12);
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($tempPassword),
            'role_id'   => $data['role_id'],
            'school_id' => $data['school_id'],
        ]);

        // Send email verification notification so the user can set their password.
        $user->sendEmailVerificationNotification();
        dispatch(new UserWelcome($user, $tempPassword));

        return redirect()->route('users.index')->with('success', 'User invited successfully');
    }

    // GET /users/{id}/edit
    public function edit($id)
    {
        $user = User::findOrFail($id);
        $roles = Role::all();
        $schools = School::all();
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'schools' => $schools,
        ]);
    }

    // PUT /users/{id}
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'name'      => 'required|string',
            'email'     => 'required|email|unique:users,email,' . $user->id,
            'role_id'   => 'required|exists:roles,id',
            'school_id' => 'required|exists:schools,id',
        ]);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return redirect()->route('users.index')->with('success', 'User updated successfully');
    }

    // DELETE /users/{id}
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }
}
