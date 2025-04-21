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
        $query = User::with(['role', 'professor_profile', 'school'])
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
        $departments = $schools ? $schools->departments : [];

        return Inertia::render('Users/Create', [
            'roles' => $roles,
            'schools' => $schools,
            'departments' => $departments,
        ]);
    }


    // POST /users
    public function store(Request $request)
    {
        $currentUser = Auth::user();

        // Base validation rules
        $rules = [
            'name'      => 'required|string',
            'email'     => 'required|email|unique:users,email',
            'role_id'   => 'required|exists:roles,id',
            'department_id' => 'nullable|exists:departments,id',
            'office_location' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'title' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
        ];

        // Super admin can specify school, others must use their own school
        if ($currentUser->role_id === 1) {
            $rules['school_id'] = 'required|exists:schools,id';
        }

        $data = $request->validate($rules);

        // For non-super admins, force the school to be their own school
        if ($currentUser->role_id !== 1) {
            $data['school_id'] = $currentUser->school_id;
        }

        $tempPassword = Str::random(12);
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($tempPassword),
            'role_id'   => $data['role_id'],
            'school_id' => $data['school_id'],
        ]);

        // Check if this is a professor role (IDs 3 or 4) and create professor profile
        $professorRoleIds = [3, 4]; // professor and major_coordinator
        if (in_array((int)$data['role_id'], $professorRoleIds) && $request->department_id) {
            $user->professor_profile()->create([
                'department_id' => $data['department_id'],
                'office' => $data['office_location'] ?? null,
                'phone' => $data['phone_number'] ?? null,
                'title' => $data['title'] ?? null,
                'website' => $data['website'] ?? null,
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
        $currentUser = Auth::user();

        // Check if the current user is authorized to edit this user
        // School admins can only edit users from their own school
        if ($currentUser->role_id !== 1 && $user->school_id !== $currentUser->school_id) {
            abort(403, 'You are not authorized to edit users from other schools.');
        }

        // Get roles - super admin can see all roles, others have restrictions
        $roles = Role::when($currentUser->role_id != 1, function($q) {
            return $q->where('id', '>', 1);
        })->get();

        // Get schools - only super admin can see all schools, others only see their own
        $schools = $currentUser->role_id === 1 ? School::all() : [$currentUser->school];

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
        $currentUser = Auth::user();

        // Prepare validation rules
        $rules = [
            'name'      => 'required|string',
            'email'     => 'required|email|unique:users,email,' . $user->id,
            'role_id'   => 'required|exists:roles,id',
        ];

        // Only allow super admins to change school
        if ($currentUser->role_id === 1) {
            $rules['school_id'] = 'required|exists:schools,id';
        }

        $data = $request->validate($rules);

        // For school admins, keep the original school
        if ($currentUser->role_id !== 1) {
            // Remove school_id if present in the request
            unset($data['school_id']);
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return redirect()->route('users.show', $user->id)->with('success', 'User updated successfully');
    }

    // DELETE /users/{id}
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $currentUser = Auth::user();

        // Check if current user can delete this user
        // Only super admin can delete any user, school admins can only delete from their school
        if ($currentUser->role_id !== 1 && $user->school_id !== $currentUser->school_id) {
            abort(403, 'You are not authorized to delete users from other schools.');
        }

        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        // Load basic user data
        $user->load([
            'role',
            'school',
            'professor_profile.department'
        ]);

        // Get departments for the school
        $departments = $user->school->departments ?? [];

        // Directly fetch course registrations with relations
        $courseRegistrations = \App\Models\CourseRegistration::with([
            'section.course',
            'section.professor_profile.user',
            'section.schedules.room'
        ])
        ->where('user_id', $user->id)
        ->get();

        // Convert user to array and add course registrations
        $userData = $user->toArray();
        $userData['courseRegistrations'] = $courseRegistrations;
        $userData['course_registrations'] = $courseRegistrations; // For backward compatibility

        return Inertia::render('Users/Show', [
            'user' => $userData,
            'departments' => $departments
        ]);
    }
}
