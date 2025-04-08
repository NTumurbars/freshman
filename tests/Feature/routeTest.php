<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Route;

class RouteTest extends TestCase
{
    /** @test */
    public function all_get_routes_return_success()
    {
        foreach (Route::getRoutes() as $route) {
            // Only test GET routes       
            if (in_array('GET', $route->methods()) && $route->getName() !== null) {

                if (str_contains($route->uri(), 'sanctum') || str_contains($route->uri(), 'api')) {
                    continue;
                }     

                try {
                    $response = $this->get(route($route->getName()));
                    $response->assertStatus(200); // or maybe 302 if you expect redirects
                } catch (\Exception $e) {
                    $this->fail('Route ' . $route->uri() . ' failed: ' . $e->getMessage());
                }
            }
        }
    }
}
