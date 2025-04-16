<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class RouteAccessAutoTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        // Create a default test user

        $this->seed();

        $this->seed(\Database\Seeders\MassiveTestSeeder::class);

        $this->user = User::factory()->create();
    }

    /** @test */
    public function all_get_routes_return_expected_status()
    {
        $routes = collect(Route::getRoutes())->filter(function ($route) {
            return in_array('GET', $route->methods()) &&
                   !str_starts_with($route->uri(), '_') &&  // Skip debugbar, etc.
                   strpos($route->uri(), 'sanctum') === false && // Skip Laravel Sanctum
                   !in_array('api', $route->middleware()); // Skip API routes here, optional
        });

        foreach ($routes as $route) {
            $uri = $route->uri();

            $requiresAuth = collect($route->middleware())->contains('auth');

            $response = $requiresAuth
                ? $this->actingAs($this->user)->get($uri)
                : $this->get($uri);

            $status = $response->getStatusCode();

            $this->assertTrue(
                in_array($status, [200, 302]),
                "Route [{$route->getName()}] [$uri] with middlewares [" . implode(',', $route->middleware()) . "] returned [$status]"
            );            
        }
    }
}
