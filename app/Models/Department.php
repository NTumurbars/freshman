<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use App\Models\School;
use App\Models\Major;
use App\Models\ProfessorProfile;
use App\Models\Course;

class Department extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'school_id',
        'name',
        'code',
        'contact'
    ];

    protected $casts = [
        'contact' => 'array'
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }


    public function majors()
    {
        return $this->hasMany(Major::class);
    }

    public function professor_profiles()
    {
        return $this->hasMany(ProfessorProfile::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
