<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'fio',
        'iin',
        'birth_date',
        'gender',
        'address',
        'contacts',
        'photo',
        'clinic_id',
        'district_doctor_id',
        'osms_status',
        'osms_end_date',
        'osms_type',
        'profile_complete',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'osms_end_date' => 'date',
            'osms_status' => 'boolean',
            'profile_complete' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'clinic_id');
    }

    public function districtDoctor(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'district_doctor_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
