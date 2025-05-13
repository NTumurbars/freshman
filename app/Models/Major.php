<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use App\Models\Department;
use App\Models\Course;

class Major extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'department_id', 
        'code',
        'name',
        'description'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
