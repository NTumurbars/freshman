<?php

namespace App\Jobs;

use App\Mail\UserWelcomeMail;
use App\Models\School;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class UserWelcome implements ShouldQueue
{
    use Queueable;

    public $user;
    public $password;

    public function __construct($user, $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function handle()
    {
        $user = $this->user;
        $password = $this->password;
        $subject = 'User Registration';

        $school = School::find($user->school_id);
        if (!$school) {
            return;
        }

        $roleMessages = [
            2 => 'admin',
            3 => 'major coordinator',
            4 => 'assistant professor',
        ];
        $role = $roleMessages[$user->role_id] ?? 'student';

        $msg = "Welcome to {$school->name} as a {$role}. These are your credentials: 
                Login Mail ID: {$user->email} 
                Login Password: {$password}";

        Mail::to($user->email)->send(new UserWelcomeMail($msg, $subject));
    }
}
