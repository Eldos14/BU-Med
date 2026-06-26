<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkPlace extends Model
{
    /** @use HasFactory<\Database\Factories\WorkPlaceFactory> */
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'branch_id',
        'room',
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
