<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\School;
use App\Models\Section;

class Term extends Model
{
      protected $fillable = [
        'school_id',
        'name',
        'start_date',
        'end_date',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }
}
