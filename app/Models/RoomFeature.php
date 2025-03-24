<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Room;
use App\Models\Section;

class RoomFeature extends Model
{
     protected $fillable = [
        'name',
        'description'
    ];

    public function rooms()
    {
        return $this->belongsToMany(Room::class, 'room_details');
    }

    public function sections()
    {
        return $this->belongsToMany(Section::class, 'section_room_feature');
    }
}
