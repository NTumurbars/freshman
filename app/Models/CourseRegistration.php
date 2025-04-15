<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Section;
use App\Models\User;

class CourseRegistration extends Model
{
     protected $fillable = [
        'section_id',
        'user_id',
    ];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
