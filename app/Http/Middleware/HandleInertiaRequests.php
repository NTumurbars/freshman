<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Merge whatever the parent class shares by default.
        // Then override or add your own keys (e.g. 'auth') as needed.
        return array_merge(parent::share($request), [
            'auth' => [
                // This arrow function only gets called if the user is logged in,
                // returning null if not.
                'user' => fn () => $request->user()
                    ? $this->transformUser($request->user())
                    : null,
            ],
        ]);
    }

    /**
     * If the user is logged in, load role and school, then return a custom array.
     */
    protected function transformUser($user): array
    {
        // Eager load the relations you want.
        // Make sure your User model has 'role()' and 'school()' relationships defined.
        $user->load(['role', 'school']);

        return [
            'id'       => $user->id,
            'name'     => $user->name,
            'email'    => $user->email,
            // If your users table has a 'school_id' column and possibly a 'school' relation:
            'school_id' => $user->school_id,
            'school'    => $user->school ? [
                'id'    => $user->school->id,
                'name'  => $user->school->name,
            ] : null,

            // Role
            'role' => $user->role ? [
                'id'   => $user->role->id,
                'name' => $user->role->name,
            ] : null,
        ];
    }
}
