<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $staff = auth()->user()->staff;

        abort_if(! $staff, 403, 'Профиль врача не найден.');

        $staffId = $staff->getKey();

        $patientCount = Appointment::where('staff_id', $staffId)
            ->distinct('patient_id')
            ->count('patient_id');

        $newRequestsCount = Appointment::where('staff_id', $staffId)
            ->where('status', 'planned')
            ->where('start_time', '>=', now())
            ->count();

        $appointmentRequests = Appointment::with(['patient.user'])
            ->where('staff_id', $staffId)
            ->where('status', 'planned')
            ->where('start_time', '>=', now())
            ->orderBy('start_time')
            ->limit(10)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'patient_name' => $a->patient?->fio ?? $a->patient?->user?->name ?? 'Неизвестно',
                'start_time' => $a->start_time->format('d.m.Y H:i'),
                'reason' => $a->reason,
                'status' => $a->status,
            ])
            ->values();

        $upcomingAppointments = Appointment::with(['patient.user'])
            ->where('staff_id', $staffId)
            ->whereIn('status', ['planned', 'completed'])
            ->where('start_time', '>=', now())
            ->orderBy('start_time')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'patient_name' => $a->patient?->fio ?? $a->patient?->user?->name ?? 'Неизвестно',
                'start_time' => $a->start_time->format('d.m.Y H:i'),
                'reason' => $a->reason,
                'status' => $a->status,
            ])
            ->values();

        $patients = Appointment::with(['patient.user'])
            ->where('staff_id', $staffId)
            ->orderBy('start_time', 'desc')
            ->get()
            ->unique('patient_id')
            ->take(10)
            ->map(fn ($a) => [
                'id' => $a->patient_id,
                'name' => $a->patient?->fio ?? $a->patient?->user?->name ?? 'Неизвестно',
                'last_visit' => $a->start_time->format('d.m.Y H:i'),
                'status' => $a->status,
            ])
            ->values();

        // Приёмы за последние 7 дней
        $appointments7d = collect(range(6, 0))->map(function ($daysAgo) use ($staffId) {
            $day = today()->subDays($daysAgo);

            return [
                'label' => $day->translatedFormat('D'),
                'date' => $day->format('d.m'),
                'value' => Appointment::where('staff_id', $staffId)->whereDate('start_time', $day)->count(),
            ];
        })->values();

        // Приёмы по статусам
        $byStatus = Appointment::where('staff_id', $staffId)
            ->selectRaw('status, count(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        $statusBreakdown = [
            ['label' => 'Запланировано', 'value' => (int) ($byStatus['planned'] ?? 0), 'color' => '#f59e0b'],
            ['label' => 'Принято', 'value' => (int) ($byStatus['completed'] ?? 0), 'color' => '#22c55e'],
            ['label' => 'Отменено', 'value' => (int) ($byStatus['cancelled'] ?? 0), 'color' => '#ef4444'],
        ];

        $reviewCount = $staff->doctorReviews()->count();
        $ratingAvg = $reviewCount > 0 ? round((float) $staff->doctorReviews()->avg('rating'), 1) : 0;

        return Inertia::render('doctor/dashboard', [
            'doctor_name' => $staff->fio,
            'stats' => [
                'patient_count' => $patientCount,
                'new_requests' => $newRequestsCount,
                'available_slots' => 0,
                'rating_avg' => $ratingAvg,
                'rating_count' => $reviewCount,
            ],
            'appointments_7d' => $appointments7d,
            'status_breakdown' => $statusBreakdown,
            'appointment_requests' => $appointmentRequests,
            'upcoming_appointments' => $upcomingAppointments,
            'patients' => $patients,
        ]);
    }
}
