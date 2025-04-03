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
        'course_code',
        'title',
        'description',
        'capacity',
    ];

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
}
