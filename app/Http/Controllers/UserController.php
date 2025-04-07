<?php

namespace App\Http\Controllers;

use App\Jobs\UserWelcome;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Role;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
// We need to add the show method to this class
// GET|HEAD show users/{user}
class UserController extends Controller
{
    // GET /users
    public function index(Request $request)
    {
        $user = User::find(Auth::id());
        $query = User::with(['role', 'professorProfile', 'school'])
            ->when($user->role_id != 1, function($q) use ($user) {
                return $q->where('school_id', $user->school_id)
                        ->whereNot('id', $user->id);
            });

        // Search and filters
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->role) {
            $query->where('role_id', $request->role);
        }

        if ($request->status) {
            $query->when($request->status === 'active', function($q) {
                return $q->whereNotNull('email_verified_at');
            }, function($q) {
                return $q->whereNull('email_verified_at');
            });
        }

        // Sorting
        $sortField = $request->sort_by ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';
        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $users = $query->paginate(10)->withQueryString();

        $roles = Role::when($user->role_id != 1, function($q) {
            return $q->where('id', '>', 1);
        })->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'status' => $request->status,
                'sort_by' => $sortField,
                'sort_direction' => $sortDirection
            ]
        ]);
    }


    // GET /users/create
    public function create()
    {
        $user = User::find(Auth::id());
        $roles = Role::where('id', '>', 1)->get();
        $schools = $user->school;
        $departments = $schools->departments;

        return Inertia::render('Users/Create', [
            'roles' => $roles,
            'schools' => $schools,
            'departments' => $departments,
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
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $tempPassword = Str::random(12);
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($tempPassword),
            'role_id'   => $data['role_id'],
            'school_id' => $data['school_id'],
        ]);

        if ($request->department_id)
        {
            $user->professorProfile()->create([
            'department_id' => $data['department_id'],
            ]);
        }

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

    public function show(User $user)
    {
        $this->authorize('view', $user);

        $user->load(['role', 'school', 'professorProfile.department']);

        return Inertia::render('Users/Show', [
            'user' => $user,
            'activityLog' => $user->activities()
                ->latest()
                ->take(10)
                ->get()
        ]);
    }
}
