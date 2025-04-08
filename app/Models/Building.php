<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Floor;
use App\Models\Room;

class Building extends Model
{
    protected $fillable = [
        'school_id',
        'name'
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function floors()
    {
        return $this->hasMany(Floor::class);
    }

    public function rooms()
    {
        return $this->hasManyThrough(Room::class, Floor::class);
    }

    public function getFloorsCountAttribute()
    {
        return $this->floors()->count();
    }

    public function getRoomsCountAttribute()
    {
        return Room::whereHas('floor', function($query) {
            $query->where('building_id', $this->id);
        })->count();
    }
}
