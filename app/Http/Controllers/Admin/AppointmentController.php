<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();

        $appointments = Appointment::with(['patient.user', 'staff'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest('start_time')
            ->paginate(20)
            ->through(fn ($a) => [
                'id' => $a->id,
                'patient_name' => $a->patient?->fio ?? $a->patient?->user?->name ?? 'Неизвестно',
                'doctor_name' => $a->staff?->fio ?? '—',
                'start_time' => $a->start_time->format('d.m.Y H:i'),
                'reason' => $a->reason,
                'status' => $a->status,
            ]);

        return Inertia::render('admin/appointments/index', [
            'appointments' => $appointments,
            'filter_status' => $status,
        ]);
    }

    public function update(Request $request, Appointment $appointment): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:planned,completed,cancelled'],
        ]);

        $appointment->update(['status' => $validated['status']]);

        return back()->with('success', 'Статус записи обновлён.');
    }
}
