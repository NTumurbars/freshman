<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\Building;
use App\Models\Floor;
use App\Models\Room;

class BuildingFloorRoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all schools
        $schools = School::all();

        foreach ($schools as $school) {
            // Create buildings for each school
            $building1 = Building::updateOrCreate(
                ['name' => 'Main Building', 'school_id' => $school->id],
            );

            $building2 = Building::updateOrCreate(
                ['name' => 'Science Building', 'school_id' => $school->id],
            );

            // Create floors for Main Building (from 1 to 5)
            for ($i = 1; $i <= 5; $i++) {
                $floor = Floor::updateOrCreate(
                    ['building_id' => $building1->id, 'number' => $i],
                );

                // Create rooms for each floor
                $roomsPerFloor = rand(3, 6);
                for ($j = 1; $j <= $roomsPerFloor; $j++) {
                    $roomNumber = $i * 100 + $j; // Room number format: floor_number + room_number (e.g. 101, 102, 201, 202)
                    Room::updateOrCreate(
                        ['floor_id' => $floor->id, 'room_number' => $roomNumber],
                        ['capacity' => rand(20, 50)]
                    );
                }
            }

            // Create floors for Science Building (from 1 to 3)
            for ($i = 1; $i <= 3; $i++) {
                $floor = Floor::updateOrCreate(
                    ['building_id' => $building2->id, 'number' => $i],
                );

                // Create rooms for each floor
                $roomsPerFloor = rand(2, 4);
                for ($j = 1; $j <= $roomsPerFloor; $j++) {
                    $roomNumber = "S" . $i . "0" . $j; // Room number format: S + floor_number + room_number (e.g. S101, S102)
                    Room::updateOrCreate(
                        ['floor_id' => $floor->id, 'room_number' => $roomNumber],
                        ['capacity' => rand(15, 40)]
                    );
                }
            }
        }

        $this->command->info('Buildings, Floors, and Rooms seeded successfully!');
    }
}
