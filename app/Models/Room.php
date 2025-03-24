<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\School;
use App\Models\RoomFeature;
use App\Models\Schedule;

class Room extends Model
{
    protected $fillable = [
        'school_id',
        'room_number',
        'building',
        'capacity',
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
}
