<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Section;
use App\Models\Room;

class Schedule extends Model
{
    protected $fillable = [
        'section_id',
        'room_id',
        'day_of_week',
        'start_time',
        'end_time',
        'meeting_pattern',
        'location_type',
        'virtual_meeting_url',
    ];

    // Add accessors to API responses
    protected $appends = ['display_name', 'pattern_name', 'days_of_week'];

    // Meeting pattern constants
    const PATTERN_SINGLE = 'single';
    const PATTERN_WEEKLY = 'weekly';
    const PATTERN_MWF = 'monday-wednesday-friday';
    const PATTERN_TTH = 'tuesday-thursday';
    const PATTERN_MW = 'monday-wednesday';
    const PATTERN_TF = 'tuesday-friday';

    // Location type constants
    const LOCATION_IN_PERSON = 'in-person';
    const LOCATION_VIRTUAL = 'virtual';
    const LOCATION_HYBRID = 'hybrid';

    /**
     * Custom mutator to ensure day_of_week is correctly set
     */
    public function setDayOfWeekAttribute($value)
    {
        $this->attributes['day_of_week'] = $value;
    }

    /**
     * Get the day_of_week attribute
     */
    public function getDayOfWeekAttribute($value)
    {
        return $value;
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get all days of the week for this schedule based on the meeting pattern
     */
    public function getDaysOfWeekAttribute()
    {
        // If this is part of a grouped pattern, return just this day
        // This ensures individual schedules always return their specific day
        if ($this->meeting_pattern === self::PATTERN_SINGLE || empty($this->meeting_pattern)) {
            return [$this->day_of_week];
        }

        // For schedules with meeting patterns, return all days in the pattern
        switch($this->meeting_pattern) {
            case self::PATTERN_MWF:
                return ['Monday', 'Wednesday', 'Friday'];
            case self::PATTERN_TTH:
                return ['Tuesday', 'Thursday'];
            case self::PATTERN_MW:
                return ['Monday', 'Wednesday'];
            case self::PATTERN_TF:
                return ['Tuesday', 'Friday'];
            case self::PATTERN_WEEKLY:
                return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            default:
                return [$this->day_of_week];
        }
    }

    /**
     * Get a display name for this schedule including day of week and time
     */
    public function getDisplayNameAttribute()
    {
        $timeFormat = substr($this->start_time, 0, 5) . ' - ' . substr($this->end_time, 0, 5);
        return $this->day_of_week . ', ' . $timeFormat;
    }

    // Add accessor for pattern name
    public function getPatternNameAttribute()
    {
        switch($this->meeting_pattern) {
            case self::PATTERN_MWF:
                return 'MWF';
            case self::PATTERN_TTH:
                return 'TTh';
            case self::PATTERN_MW:
                return 'MW';
            case self::PATTERN_TF:
                return 'TF';
            case self::PATTERN_WEEKLY:
                return 'Weekly';
            default:
                return $this->day_of_week;
        }
    }

    /**
     * Check if the assigned room has sufficient capacity for the section
     * Used during room assignment to ensure adequate capacity
     */
    public function hasAdequateRoomCapacity()
    {
        // If no room is assigned, no capacity check needed
        if (!$this->room_id) {
            return true;
        }

        // If no section exists, skip check
        if (!$this->section) {
            return true;
        }

        // Check if the room capacity is adequate for the section
        return $this->section->hasEnoughCapacity($this->room->capacity);
    }
}
