<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    /** @use HasFactory<\Database\Factories\BranchFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'department',
        'address',
        'phone',
    ];

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function workPlaces(): HasMany
    {
        return $this->hasMany(WorkPlace::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class, 'clinic_id');
    }

    public function staff()
    {
        return $this->belongsToMany(Staff::class, 'work_places')->withPivot('room');
    }
}
