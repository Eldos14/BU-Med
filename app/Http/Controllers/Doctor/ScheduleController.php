<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(): Response
    {
        $staff = auth()->user()->staff;

        abort_if(! $staff, 403, 'Профиль врача не найден.');

        $appointments = Appointment::with(['patient.user'])
            ->where('staff_id', $staff->getKey())
            ->where('start_time', '>=', now()->subMonths(1)->startOfMonth())
            ->where('start_time', '<=', now()->addMonths(2)->endOfMonth())
            ->orderBy('start_time')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'date' => $a->start_time->toDateString(),
                'patient_name' => $a->patient?->fio ?? $a->patient?->user?->name ?? 'Неизвестно',
                'start_time' => $a->start_time->format('H:i'),
                'end_time' => $a->end_time?->format('H:i') ?? null,
                'reason' => $a->reason,
                'status' => $a->status,
            ])
            ->values();

        return Inertia::render('doctor/schedule', [
            'appointments' => $appointments,
            'today' => now()->toDateString(),
        ]);
    }
}
