<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Course;
use App\Models\Department;
use App\Models\School;
use App\Models\Term;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class StatsController extends Controller
{
    public function superUser(): JsonResponse
    {
        $schools = School::all()->count();
        $departments = Department::all()->count();
        $users = User::all()->count();
        
        // Get all active terms (current date falls between start_date and end_date)
        $activeTerms = Term::where('start_date', '<=', Carbon::now())
            ->where('end_date', '>=', Carbon::now())
            ->count();

        return response()->json([
            'schools' => $schools,
            'users' => $users,
            'activeTerms' => $activeTerms,
        ]);
    }

    public function schoolAdmin(): JsonResponse
    {
        $school_id = Auth::user()->school_id;
        $departments = Department::where('school_id', $school_id)->with('courses')->count();
        $users = User::where('school_id', $school_id)->count();
        $buildings = Building::where('school_id', $school_id)->count();
        
        // Get current term (where current date falls between start_date and end_date)
        $currentTerm = Term::where('school_id', $school_id)
            ->where('start_date', '<=', Carbon::now())
            ->where('end_date', '>=', Carbon::now())
            ->first();
            
        // Get active courses for current term
        $activeCourses = 0;
        if ($currentTerm) {
            $activeCourses = Course::where('is_active', true)
                ->whereHas('sections', function($query) use ($currentTerm) {
                    $query->where('term_id', $currentTerm->id);
                })->count();
        }
        
        // Count schedule conflicts 
        $scheduleConflicts = 0; // You can implement your conflict detection logic here

        return response()->json([
            'departments' => $departments,
            'users' => $users,
            'buildings' => $buildings,
            'currentTerm' => $currentTerm,
            'activeCourses' => $activeCourses,
            'scheduleConflicts' => $scheduleConflicts,
        ]);
    }
}
