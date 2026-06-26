<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Staff;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'start_time' => 'required|date|after:now',
            'reason' => 'nullable|string|max:500',
        ]);

        $patient = $request->user()->patient;

        // Пациент может записаться только к своему участковому врачу.
        // К узким специалистам / на рентген / флюорографию направляет сам участковый врач.
        abort_unless(
            $patient && (int) $patient->district_doctor_id === (int) $request->staff_id,
            403,
            'Запись доступна только к вашему участковому врачу. К другим специалистам направляет участковый врач.'
        );

        $start = Carbon::parse($request->start_time);

        $taken = Appointment::where('staff_id', $request->staff_id)
            ->where('status', 'planned')
            ->where('start_time', $start)
            ->exists();

        if ($taken) {
            return back()->withErrors(['start_time' => 'Это время уже занято. Выберите другое.']);
        }

        Appointment::create([
            'patient_id' => $patient->id,
            'staff_id' => $request->staff_id,
            'start_time' => $start,
            'end_time' => $start->copy()->addMinutes(30),
            'reason' => $request->reason,
            'status' => 'planned',
        ]);

        $doctorUserId = Staff::find($request->staff_id)?->user_id;
        if ($doctorUserId) {
            Notification::create([
                'user_id' => $doctorUserId,
                'message' => "Новая запись: {$patient->fio} — {$start->format('d.m.Y H:i')}".($request->reason ? " ({$request->reason})" : ''),
                'is_read' => false,
            ]);
        }

        return to_route('patient.history')->with('success', 'Запись успешно создана!');
    }

    public function cancel(Appointment $appointment): RedirectResponse
    {
        abort_unless($appointment->patient_id === auth()->user()->patient->id, 403);
        abort_if($appointment->isCancelled(), 422);

        $appointment->update(['status' => 'cancelled']);

        return back()->with('success', 'Запись отменена.');
    }
}
