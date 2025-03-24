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
    ];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
