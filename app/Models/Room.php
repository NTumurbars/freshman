<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\School;
use App\Models\RoomFeature;
use App\Models\Schedule;
use App\Models\Floor;

class Room extends Model
{
    protected $fillable = [
        'room_number',
        'floor_id',
        'capacity',
    ];

    protected $appends = ['name', 'school'];

    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }

    public function features()
    {
        return $this->belongsToMany(RoomFeature::class, 'room_details');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Get the school this room belongs to through floor->building->school
     */
    public function getSchoolAttribute()
    {
        return $this->floor->building->school ?? null;
    }

    /**
     * Get the full name of the room (building name + room number)
     */
    public function getNameAttribute()
    {
        $buildingName = $this->floor->building->name ?? '';
        return $buildingName ? "{$buildingName} {$this->room_number}" : $this->room_number;
    }
}
