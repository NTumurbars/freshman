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
        'title',
        'office',
        'phone',
        'website',
    ];

    // Make sure we have proper eager loading
    protected $with = ['user'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
