<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(): Response
    {
        $staff = auth()->user()->staff;

        abort_if(! $staff, 403, 'Профиль врача не найден.');

        $reviews = \App\Models\DoctorReview::where('staff_id', $staff->getKey())
            ->get()
            ->keyBy('patient_id');

        $patients = Appointment::with(['patient.user'])
            ->where('staff_id', $staff->getKey())
            ->get()
            ->groupBy('patient_id')
            ->map(function ($appointments) use ($reviews) {
                $latest = $appointments->sortByDesc('start_time')->first();
                $review = $reviews->get($latest->patient_id);

                return [
                    'id' => $latest->patient_id,
                    'name' => $latest->patient?->fio ?? $latest->patient?->user?->name ?? 'Неизвестно',
                    'last_visit' => $latest->start_time->format('d.m.Y H:i'),
                    'visit_count' => $appointments->count(),
                    'review_rating' => $review?->rating,
                    'review_text' => $review?->text,
                    'review_recommend' => (bool) $review?->recommend,
                ];
            })
            ->sortByDesc('last_visit')
            ->values();

        return Inertia::render('doctor/patients/index', [
            'patients' => $patients,
            'rating_avg' => round((float) \App\Models\DoctorReview::where('staff_id', $staff->getKey())->avg('rating'), 1),
            'rating_count' => \App\Models\DoctorReview::where('staff_id', $staff->getKey())->count(),
        ]);
    }

    public function history(int $patientId): Response
    {
        $staff = auth()->user()->staff;

        abort_if(! $staff, 403, 'Профиль врача не найден.');

        $patient = Patient::with('user')->findOrFail($patientId);

        abort_unless(
            Appointment::where('staff_id', $staff->getKey())
                ->where('patient_id', $patientId)
                ->exists(),
            403
        );

        $appointments = Appointment::where('staff_id', $staff->getKey())
            ->where('patient_id', $patientId)
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'start_time' => $a->start_time->format('d.m.Y H:i'),
                'end_time' => $a->end_time?->format('d.m.Y H:i') ?? '—',
                'reason' => $a->reason,
                'status' => $a->status,
            ]);

        return Inertia::render('doctor/patients/history', [
            'patient_name' => $patient->fio ?? $patient->user?->name ?? 'Неизвестно',
            'doctor_name' => $staff->fio ?? auth()->user()->name,
            'appointments' => $appointments->values(),
        ]);
    }
}
