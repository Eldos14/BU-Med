<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function create(): Response
    {
        abort_if(! auth()->user()->staff, 403, 'Профиль врача не найден.');

        return Inertia::render('doctor/appointments/index');
    }

    public function searchPatients(Request $request): JsonResponse
    {
        abort_if(! auth()->user()->staff, 403);

        $q = trim($request->input('q', ''));

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $patients = Patient::with('user')
            ->where(function ($query) use ($q) {
                $query->where('fio', 'like', "%{$q}%")
                    ->orWhere('iin', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$q}%"));
            })
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'fio' => $p->fio ?? $p->user?->name ?? 'Неизвестно',
                'email' => $p->user?->email ?? '',
                'iin' => $p->iin ?? '',
                'photo' => $p->photo ? '/storage/'.$p->photo : null,
            ]);

        return response()->json($patients);
    }

    public function patientHistory(int $patientId): JsonResponse
    {
        abort_if(! auth()->user()->staff, 403);

        $appointments = Appointment::with('staff.user')
            ->where('patient_id', $patientId)
            ->orderByDesc('start_time')
            ->limit(8)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'date' => $a->start_time->format('d.m.Y'),
                'time' => $a->start_time->format('H:i'),
                'reason' => $a->reason,
                'status' => $a->status,
                'doctor' => $a->staff?->fio ?? $a->staff?->user?->name ?? 'Неизвестно',
            ]);

        return response()->json($appointments);
    }

    public function store(Request $request): RedirectResponse
    {
        $staff = auth()->user()->staff;

        abort_if(! $staff, 403, 'Профиль врача не найден.');

        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'start_time' => ['required', 'date', 'after:now'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $taken = Appointment::where('staff_id', $staff->getKey())
            ->where('status', 'planned')
            ->where('start_time', $validated['start_time'])
            ->exists();

        if ($taken) {
            return back()->withErrors(['start_time' => 'Это время уже занято.'])->withInput();
        }

        Appointment::create([
            'staff_id' => $staff->getKey(),
            'patient_id' => $validated['patient_id'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'reason' => $validated['reason'],
            'status' => 'planned',
        ]);

        $patient = Patient::find($validated['patient_id']);
        $start = Carbon::parse($validated['start_time']);
        if ($patient?->user_id) {
            Notification::create([
                'user_id' => $patient->user_id,
                'message' => "Врач записал вас на прием: {$start->format('d.m.Y H:i')} — {$validated['reason']}",
                'is_read' => false,
            ]);
        }

        return redirect()->route('doctor.dashboard')->with('success', 'Запись создана.');
    }

    public function accept(Appointment $appointment): RedirectResponse
    {
        $staff = auth()->user()->staff;
        abort_unless($appointment->staff_id === $staff?->getKey(), 403);
        abort_unless($appointment->isPlanned(), 422);

        $appointment->update(['status' => 'completed']);

        return back()->with('success', 'Запись принята.');
    }

    public function cancel(Appointment $appointment): RedirectResponse
    {
        $staff = auth()->user()->staff;
        abort_unless($appointment->staff_id === $staff?->getKey(), 403);
        abort_unless($appointment->isPlanned(), 422);

        $appointment->update(['status' => 'cancelled']);

        return back()->with('success', 'Запись отменена.');
    }
}
