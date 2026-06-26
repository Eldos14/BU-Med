<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Specialization;
use App\Models\Staff;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'doctors' => Staff::count(),
            'patients' => Patient::count(),
            'appointments_today' => Appointment::whereDate('start_time', today())->count(),
            'appointments_total' => Appointment::count(),
            'planned' => Appointment::where('status', 'planned')->count(),
        ];

        // Записи по статусам (для пончика)
        $byStatus = Appointment::selectRaw('status, count(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        $statusBreakdown = [
            ['label' => 'Запланировано', 'value' => (int) ($byStatus['planned'] ?? 0), 'color' => '#f59e0b'],
            ['label' => 'Принято', 'value' => (int) ($byStatus['completed'] ?? 0), 'color' => '#22c55e'],
            ['label' => 'Отменено', 'value' => (int) ($byStatus['cancelled'] ?? 0), 'color' => '#ef4444'],
        ];

        // Записи за последние 7 дней (для столбчатой диаграммы)
        $appointments7d = collect(range(6, 0))->map(function ($daysAgo) {
            $day = today()->subDays($daysAgo);

            return [
                'label' => $day->translatedFormat('D'),
                'date' => $day->format('d.m'),
                'value' => Appointment::whereDate('start_time', $day)->count(),
            ];
        })->values();

        // Врачи по специальностям (горизонтальные бары)
        $palette = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981'];
        $doctorsBySpecialty = Specialization::selectRaw('specialty, count(*) as c')
            ->groupBy('specialty')
            ->orderByDesc('c')
            ->limit(6)
            ->get()
            ->values()
            ->map(fn ($row, $i) => [
                'label' => $row->specialty,
                'value' => (int) $row->c,
                'color' => $palette[$i % count($palette)],
            ]);

        // ОСМС пациентов (пончик)
        $osmsActive = Patient::where('osms_status', true)->count();
        $osmsBreakdown = [
            ['label' => 'Активен', 'value' => $osmsActive, 'color' => '#22c55e'],
            ['label' => 'Не активен', 'value' => Patient::count() - $osmsActive, 'color' => '#94a3b8'],
        ];

        $recentAppointments = Appointment::with(['patient.user', 'staff'])
            ->latest('start_time')
            ->limit(8)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'patient_name' => $a->patient?->fio ?? $a->patient?->user?->name ?? 'Неизвестно',
                'doctor_name' => $a->staff?->fio ?? '—',
                'start_time' => $a->start_time->format('d.m.Y H:i'),
                'status' => $a->status,
            ]);

        $recentDoctors = Staff::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'fio' => $s->fio,
                'position' => $s->position,
                'email' => $s->user?->email ?? '—',
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'status_breakdown' => $statusBreakdown,
            'appointments_7d' => $appointments7d,
            'doctors_by_specialty' => $doctorsBySpecialty,
            'osms_breakdown' => $osmsBreakdown,
            'recent_appointments' => $recentAppointments,
            'recent_doctors' => $recentDoctors,
        ]);
    }
}
