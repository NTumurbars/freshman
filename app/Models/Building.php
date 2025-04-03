<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function getFloorsCountAttribute()
    {
        return $this->floors()->count();
    }
}
