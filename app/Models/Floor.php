<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Building;

class Floor extends Model
{
    protected $fillable = [
        'building_id',
        'number',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

     public function roomsCount()
    {
        return $this->rooms()->count();
    }
}

