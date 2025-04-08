<?php

namespace App\Models;

use App\Jobs\UserWelcome;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class School extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'code',
        'email',
        'website_url',
        'logo_url',
        'description',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'phone',
        'timezone',
        'settings',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'settings' => 'array',
    ];

    /**
     * The validation rules that apply to the model.
     *
     * @return array<string, string>
     */
    public static function validationRules($id = null)
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'email' => [
                'required',
                'email',
                Rule::unique('schools')->ignore($id),
                Rule::unique('users')->ignore($id, 'school_id')
            ],
            'website_url' => 'nullable|url|max:255',
            'logo_url' => 'nullable|url|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'timezone' => 'nullable|string|max:100',
            'settings' => 'nullable|array',
        ];
    }

    protected static function booted()
    {
        static::created(function (School $school) {
            $adminRole = Role::firstOrCreate(['name' => 'school_admin']);

            $plainPassword = Str::random(12);
            $adminEmail = $school->email;
            $adminName = "Admin - {$school->name}";

            // Create default admin user for the school
            $admin = User::create([
                'school_id' => $school->id,
                'role_id'   => $adminRole->id,
                'name'      => $adminName,
                'email'     => $adminEmail,
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
