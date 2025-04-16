<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

use Illuminate\Database\Eloquent\Model;
use App\Models\School;
use App\Models\Section;

class Term extends Model
{

    use HasFactory, Notifiable;

    protected $fillable = [
        'school_id',
        'name',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    /**
     * Get the active term for a school based on current date
     */
    public static function getActiveTerm(School $school)
    {
        $today = now()->startOfDay();

        return self::where('school_id', $school->id)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->first();
    }

    /**
     * Update the active term for a school
     */
    public static function updateActiveTerm(School $school)
    {
        // First, deactivate all terms for this school
        self::where('school_id', $school->id)->update(['is_active' => false]);

        // Then, find and activate the current term
        $activeTerm = self::getActiveTerm($school);
        if ($activeTerm) {
            $activeTerm->update(['is_active' => true]);
        }

        return $activeTerm;
    }
}
