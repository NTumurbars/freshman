<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Department;

class ProfessorProfile extends Model
{
    protected $fillable = 
    [
        'user_id',
        'department_id',
        'office_location',
        'phone_number',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    } 
}
