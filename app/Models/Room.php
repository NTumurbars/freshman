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
        'capacity',
        'floor_id',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function features()
    {
        return $this->belongsToMany(RoomFeature::class, 'room_details');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
    
    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }
}
