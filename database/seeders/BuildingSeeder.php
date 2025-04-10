<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\Building;
use App\Models\Floor;
use App\Models\Room;
use App\Models\RoomFeature;

class BuildingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder creates all physical space data:
     * 1. Buildings for each school
     * 2. Floors for each building
     * 3. Rooms for each floor
     * 4. Room features and assigns them to rooms
     */
    public function run(): void
    {
        $this->command->info('Starting physical space seeding process...');

        // Get all schools
        $schools = School::all();

        // Create buildings, floors and rooms for each school
        foreach ($schools as $school) {
            $this->createBuildingsForSchool($school);
        }

        // Create and assign room features
        $this->createAndAssignRoomFeatures();

        $this->command->info('Buildings, Floors, Rooms and Features seeded successfully!');
    }

    /**
     * Create buildings, floors and rooms for a school
     */
    private function createBuildingsForSchool($school)
    {
        // Create buildings for the school
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

    /**
     * Create room features and assign them to rooms
     */
    private function createAndAssignRoomFeatures()
    {
        $this->command->info('Creating and assigning room features...');

        // Create common room features with categories and descriptions
        $roomFeatures = [
            [
                'name' => 'Projector',
                'category' => 'Technology',
                'description' => 'High-definition projector for presentations and video content'
            ],
            [
                'name' => 'Smart Board',
                'category' => 'Technology',
                'description' => 'Interactive whiteboard with touch capabilities and digital content sharing'
            ],
            [
                'name' => 'Computer Lab',
                'category' => 'Technology',
                'description' => 'Room equipped with multiple workstations for student use'
            ],
            [
                'name' => 'Video Conferencing',
                'category' => 'Technology',
                'description' => 'Advanced audio/video equipment for remote meetings and lectures'
            ],
            [
                'name' => 'Accessible Entrance',
                'category' => 'Accessibility',
                'description' => 'Wheelchair accessible entrance and pathways'
            ],
            [
                'name' => 'Adjustable Desks',
                'category' => 'Furniture',
                'description' => 'Height-adjustable desks to accommodate various needs'
            ],
            [
                'name' => 'Movable Seating',
                'category' => 'Furniture',
                'description' => 'Flexible seating arrangements that can be reconfigured for different activities'
            ],
            [
                'name' => 'Lab Equipment',
                'category' => 'Technology',
                'description' => 'Specialized scientific or engineering equipment for hands-on learning'
            ],
            [
                'name' => 'Recording Equipment',
                'category' => 'Audio/Visual',
                'description' => 'Audio and video recording capabilities for lecture capture'
            ],
            [
                'name' => 'Emergency Exits',
                'category' => 'Safety',
                'description' => 'Multiple emergency exits with proper signage and lighting'
            ],
            [
                'name' => 'First Aid Kit',
                'category' => 'Safety',
                'description' => 'Fully stocked first aid kit for emergencies'
            ]
        ];

        foreach ($roomFeatures as $feature) {
            RoomFeature::updateOrCreate(
                ['name' => $feature['name']],
                [
                    'category' => $feature['category'],
                    'description' => $feature['description']
                ]
            );
        }

        // Assign features to random rooms
        $rooms = Room::all();
        $allFeatures = RoomFeature::all();

        foreach ($rooms as $room) {
            // Assign 2-5 random features to each room
            $featureCount = rand(2, 5);
            $featureIds = $allFeatures->random($featureCount)->pluck('id')->toArray();
            $room->features()->sync($featureIds);
        }
    }
}
