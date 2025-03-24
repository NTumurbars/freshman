<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Course;
use App\Models\User;
use App\Models\Term;
use App\Models\CourseRegistration;
use App\Models\Schedule;
use App\Models\RoomFeature;

class Section extends Model
{
    protected $fillable = [
        'course_id',
        'term_id',
        'professor_id',
        'section_code',
        'number_of_students',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    public function professor()
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    public function courseRegistrations()
    {
        return $this->hasMany(CourseRegistration::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function requiredFeatures()
    {
        return $this->belongsToMany(RoomFeature::class, 'section_room_feature');
    }
}
