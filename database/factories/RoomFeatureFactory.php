<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RoomFeature>
 */
class RoomFeatureFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roomFeatures = [
            [
                'name' => 'Built-in Projector',
                'description' => 'Room includes a ceiling-mounted projector connected to instructor stations.',
            ],
            [
                'name' => 'Chalkboard',
                'description' => 'Traditional chalkboard available for writing and presentations.',
            ],
            [
                'name' => 'Whiteboard',
                'description' => 'Large erasable whiteboard for notes, diagrams, and teaching aids.',
            ],
            [
                'name' => 'Smartboard',
                'description' => 'Interactive whiteboard with touch capabilities and smart features.',
            ],
            [
                'name' => 'Computer Lab Setup',
                'description' => 'Multiple computers available for student use during sessions.',
            ],
            [
                'name' => 'Video Conferencing Equipment',
                'description' => 'Camera and microphone setup for remote lectures and meetings.',
            ],
            [
                'name' => 'Surround Sound Speakers',
                'description' => 'High-quality speaker system for enhanced audio during lectures.',
            ],
            [
                'name' => 'Document Camera',
                'description' => 'Camera to display physical documents, books, or objects during lectures.',
            ],
            [
                'name' => 'Lecture Capture System',
                'description' => 'System for recording and streaming live lectures to students.',
            ],
            [
                'name' => 'Adjustable Lighting',
                'description' => 'Lighting controls available to adjust brightness for various activities.',
            ],
            [
                'name' => 'Movable Furniture',
                'description' => 'Tables and chairs can be rearranged to support flexible learning setups.',
            ],
            [
                'name' => 'Fixed Seating',
                'description' => 'Permanent seating arrangement typical for lecture halls.',
            ],
            [
                'name' => 'Accessible Seating (ADA)',
                'description' => 'Rooms include ADA-compliant seating for accessibility.',
            ],
            [
                'name' => 'AC/Climate Control',
                'description' => 'Room equipped with independent heating and cooling controls.',
            ],
            [
                'name' => 'High-Speed Wi-Fi',
                'description' => 'Reliable wireless internet access available throughout the room.',
            ],
            [
                'name' => 'Lab Stations',
                'description' => 'Individual workstations for hands-on lab experiments and projects.',
            ],
            [
                'name' => 'Safety Equipment (for Labs)',
                'description' => 'Emergency showers, eyewash stations, and fire extinguishers available.',
            ],
            [
                'name' => 'Overhead Projector',
                'description' => 'Classic overhead projector for transparent sheet presentations.',
            ],
            [
                'name' => 'Podium with Microphone',
                'description' => 'Instructor podium equipped with microphone and control panel.',
            ],
            [
                'name' => 'Charging Stations',
                'description' => 'Power outlets and USB chargers available at desks and tables.',
            ],
            [
                'name' => 'Virtual Reality (VR) Equipment',
                'description' => 'Room equipped with VR headsets and systems for immersive learning.',
            ],
            [
                'name' => '3D Printer Access',
                'description' => 'Access to 3D printers for prototyping and design projects.',
            ],
            [
                'name' => 'Soundproof Walls',
                'description' => 'Room designed with acoustic insulation for noise control.',
            ],
            [
                'name' => 'Large Display Screens',
                'description' => 'Oversized screens for presentations and video content.',
            ],
            [
                'name' => 'Dual Monitors at Desks',
                'description' => 'Each workstation equipped with dual-monitor setups for multitasking.',
            ],
            [
                'name' => 'Interactive Touchscreen Displays',
                'description' => 'Touch-enabled screens for collaborative activities and lessons.',
            ],
            [
                'name' => 'Streaming Capability',
                'description' => 'Ability to stream content live to online participants.',
            ],
            [
                'name' => 'Recording Equipment',
                'description' => 'Cameras and microphones installed for recording sessions.',
            ],
            [
                'name' => 'Lockable Storage Cabinets',
                'description' => 'Secure cabinets available for storing personal or classroom equipment.',
            ],
            [
                'name' => 'Emergency Call Button',
                'description' => 'Installed button for contacting security or emergency services quickly.',
            ],
        ];

        $feature = fake()->randomElement($roomFeatures);
        
        return [
            'name'=> $feature['name'],
            'description'=> $feature['description']
        ];
    }
}
