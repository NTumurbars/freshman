<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Department;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class StatsController extends Controller
{
    public function superUser(): JsonResponse
    {
        $schools = School::all()->count();
        $departments = Department::all()->count();
        $users = User::all()->count();

        return response()->json([
            'schools' => $schools,
            'users' => $users,
        ]);
    }

    public function schoolAdmin(): JsonResponse
    {
        $school_id = Auth::user()->school_id;
        $departments = Department::where('school_id', $school_id)->with('courses')->count();
        $users = User::where('school_id', $school_id)->count();
        $buildings = Building::where('school_id', $school_id)->count();

        return response()->json([
            'departments' => $departments,
            'users' => $users,
            'buildings' => $buildings,
        ]);
    }
}
