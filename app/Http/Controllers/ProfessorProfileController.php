<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\ProfessorProfile;
use App\Models\Department;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Redirect;

class ProfessorProfileController extends Controller
{
    // GET /professor-profiles
    public function index()
    {
        $this->authorize('viewAny', ProfessorProfile::class);
        $profiles = ProfessorProfile::with(['user', 'department'])->get();
        return Inertia::render('ProfessorProfiles/Index', ['profiles' => $profiles]);
    }

    // GET /professor-profiles/create
    public function create()
    {
        $this->authorize('create', ProfessorProfile::class);
        $departments = Department::all();
        return Inertia::render('ProfessorProfiles/Create', ['departments' => $departments]);
    }

    // POST /professor-profiles
    public function store(Request $request)
    {
        $this->authorize('create', ProfessorProfile::class);
        $data = $request->validate([
            'user_id'       => 'required|exists:users,id',
            'department_id' => 'required|exists:departments,id',
            'title'         => 'nullable|string|max:255',
            'office'        => 'nullable|string|max:255',
            'phone'         => 'nullable|string|max:50',
            'website'       => 'nullable|string|max:255',
        ]);

        ProfessorProfile::create($data);
        return redirect()->route('professor-profiles.index')->with('success', 'Professor profile created successfully');
    }

    // GET /professor-profiles/{id}/edit
    public function edit($id)
    {
        $profile = ProfessorProfile::findOrFail($id);
        $this->authorize('update', $profile);
        $departments = Department::all();
        return Inertia::render('ProfessorProfiles/Edit', [
            'profile' => $profile,
            'departments' => $departments,
        ]);
    }

    /**
     * Update the professor's profile information.
     */
    public function update(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        // Authorization check: user can only update their own profile
        // or admins can update any profile
        if ($request->user()->id !== $user->id && 
            !in_array($request->user()->role->name, ['super_admin', 'school_admin'])) {
            abort(403);
        }
        
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'title'         => 'nullable|string|max:255',
            'office'        => 'nullable|string|max:255',
            'phone'         => 'nullable|string|max:30',
            'website'       => 'nullable|string|max:255',
        ]);
        
        // Get or create professor profile
        $profile = $user->professorProfile;
        
        if (!$profile) {
            return response()->json(['message' => 'Professor profile not found'], 404);
        }
        
        $profile->update($validated);
        
        return Redirect::back()->with('success', 'Professor profile updated successfully');
    }

    // DELETE /professor-profiles/{id}
    public function destroy($id)
    {
        $profile = ProfessorProfile::findOrFail($id);
        $this->authorize('delete', $profile);
        $profile->delete();
        return redirect()->route('professor-profiles.index')->with('success', 'Professor profile deleted successfully');
    }
}
