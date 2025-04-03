<?php

namespace App\Models;

use App\Jobs\UserWelcome;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class School extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
    ];

    protected static function booted()
    {
        static::created(function (School $school) {
            $adminRole = Role::firstOrCreate(['name' => 'school_admin']);

            $plainPassword = Str::random(12);

            // Create default admin user for the school
            $admin = User::create([
                'school_id' => $school->id,
                'role_id'   => $adminRole->id,
                'name'      => 'Default Admin',
                'email'     => $school->email,
                'password'  => Hash::make($plainPassword),
            ]);

            // Dispatch credentials mail job
            dispatch(new UserWelcome($admin, $plainPassword));

            // Send email verification notification
            $admin->sendEmailVerificationNotification();
        });
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function terms()
    {
        return $this->hasMany(Term::class);
    }

    public function buildings()
    {
        return $this->hasMany(Building::class);
    }

}
