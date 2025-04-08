<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Department;
use App\Models\School;
use App\Models\Section;

// Need to add school to this and update school
class Course extends Model
{
     protected $fillable = [
        'department_id',
        'major_id',
        'code',
        'title',
        'description',
        'capacity',
        'credits',
        'level',
        'is_active',
    ];

    protected $appends = ['school'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function major()
    {
        return $this->belongsTo(Major::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    /**
     * Get the school through the department relationship
     */
    public function school()
    {
        return $this->department ? $this->department->school() : null;
    }

    /**
     * Get the school this course belongs to through department
     */
    public function getSchoolAttribute()
    {
        return $this->department ? $this->department->school : null;
    }
}
