<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

use Illuminate\Database\Eloquent\Model;
use App\Models\Course;
use App\Models\ProfessorProfile;
use App\Models\Term;
use App\Models\CourseRegistration;
use App\Models\Schedule;
use App\Models\RoomFeature;

class Section extends Model
{

    use HasFactory, Notifiable;

    protected $fillable = [
        'course_id',
        'term_id',
        'professor_profile_id',
        'section_code',
        'status',
        'delivery_method',
        'notes',
        'capacity',
    ];

    protected $casts = [
        'number_of_students' => 'integer',
        'capacity' => 'integer',
    ];

    protected $appends = ['students_count', 'effective_capacity'];

    protected $with = ['courseRegistrations.student'];

    // Status constants
    const STATUS_ACTIVE = 'active';
    const STATUS_CANCELLED = 'cancelled';

    // Delivery method constants
    const DELIVERY_IN_PERSON = 'in-person';
    const DELIVERY_ONLINE = 'online';
    const DELIVERY_HYBRID = 'hybrid';

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function term()
    {
        return $this->belongsTo(Term::class);
    }

    public function professor_profile()
    {
        return $this->belongsTo(ProfessorProfile::class, 'professor_profile_id');
    }

    public function courseRegistrations()
    {
        return $this->hasMany(CourseRegistration::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function requiredFeatures()
    {
        return $this->belongsToMany(RoomFeature::class, 'section_room_feature');
    }

    /**
     * Get the current number of enrolled students by counting course registrations
     */
    public function getStudentsCountAttribute()
    {
        return $this->courseRegistrations()->count();
    }

    /**
     * Get the effective capacity for this section
     * Combines the section's capacity with room capacities depending on delivery method
     */
    public function getEffectiveCapacityAttribute()
    {
        // If section has an explicit capacity set, use it
        if (!is_null($this->capacity)) {
            return $this->capacity;
        }

        // If online delivery method with no explicit capacity, return null
        if ($this->delivery_method === self::DELIVERY_ONLINE) {
            return null;
        }

        // For in-person/hybrid with no capacity set, try to get minimum room capacity
        if ($this->delivery_method === self::DELIVERY_IN_PERSON ||
            $this->delivery_method === self::DELIVERY_HYBRID) {

            // Get all schedules with rooms
            $scheduleRooms = $this->schedules()
                ->whereNotNull('room_id')
                ->with('room')
                ->get();

            if ($scheduleRooms->isEmpty()) {
                return null;
            }

            // Get the minimum room capacity as the limiting factor
            return $scheduleRooms->min(function($schedule) {
                return $schedule->room->capacity;
            });
        }

        return null;
    }

    /**
     * Check if a room has sufficient capacity for this section
     * Used when assigning rooms to schedules for this section
     */
    public function hasEnoughCapacity($roomCapacity)
    {
        // If no section capacity is set, any room is acceptable
        if (is_null($this->capacity)) {
            return true;
        }

        // Room must have at least the section's capacity
        return $roomCapacity >= $this->capacity;
    }
}
