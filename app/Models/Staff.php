<?php

namespace App\Models;

use Database\Factories\StaffFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Staff extends Model
{
    /** @use HasFactory<StaffFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'fio',
        'position',
        'contacts',
        'photo',
        'bio',
        'achievements',
    ];

    protected function casts(): array
    {
        return [
            'achievements' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function specializations(): HasMany
    {
        return $this->hasMany(Specialization::class);
    }

    public function workPlaces(): HasMany
    {
        return $this->hasMany(WorkPlace::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function doctorReviews(): HasMany
    {
        return $this->hasMany(DoctorReview::class);
    }

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'work_places')->withPivot('room');
    }
}
