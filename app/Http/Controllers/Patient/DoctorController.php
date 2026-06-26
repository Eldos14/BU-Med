<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Staff;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $doctors = Staff::with(['specializations', 'workPlaces.branch'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('fio', 'like', "%{$search}%")
                        ->orWhere('position', 'like', "%{$search}%")
                        ->orWhereHas('specializations', fn ($sq) => $sq->where('specialty', 'like', "%{$search}%"));
                });
            })
            ->orderBy('fio')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('patient/doctors/index', [
            'doctors' => $doctors,
            'search' => $search,
        ]);
    }

    /**
     * Запись к врачу — только к прикреплённому участковому врачу.
     */
    public function myDoctor(Request $request): Response
    {
        $patient = $request->user()->patient;

        $districtDoctor = $patient?->district_doctor_id
            ? Staff::find($patient->district_doctor_id)
            : null;

        if (! $districtDoctor) {
            return Inertia::render('patient/doctors/show', [
                'no_doctor' => true,
                'doctor' => null,
                'slots' => [],
                'reviews' => [],
                'rating_avg' => 0,
                'rating_count' => 0,
                'my_review' => null,
            ]);
        }

        return Inertia::render('patient/doctors/show', $this->buildBookingPayload($districtDoctor, $patient));
    }

    public function show(Request $request, Staff $staff): Response|\Illuminate\Http\RedirectResponse
    {
        $patient = $request->user()->patient;

        // Записаться можно только к своему участковому врачу.
        if (! $patient || (int) $patient->district_doctor_id !== (int) $staff->id) {
            return redirect()->route('patient.appointment');
        }

        return Inertia::render('patient/doctors/show', $this->buildBookingPayload($staff, $patient));
    }

    /** @return array<string, mixed> */
    private function buildBookingPayload(Staff $staff, \App\Models\Patient $patient): array
    {
        $staff->load(['specializations', 'workPlaces.branch', 'doctorReviews.patient']);
        $slots = $this->generateSlots($staff);

        $reviews = $staff->doctorReviews->sortByDesc('created_at')->values();
        $myReview = $reviews->firstWhere('patient_id', $patient->id);

        return [
            'no_doctor' => false,
            'doctor' => $staff,
            'slots' => $slots,
            'reviews' => $reviews->map(fn ($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'text' => $r->text,
                'recommend' => $r->recommend,
                'patient_name' => $r->patient?->fio,
                'created_at' => $r->created_at->toIso8601String(),
            ])->all(),
            'rating_avg' => round((float) $reviews->avg('rating'), 1),
            'rating_count' => $reviews->count(),
            'my_review' => $myReview ? [
                'rating' => $myReview->rating,
                'text' => $myReview->text,
                'recommend' => $myReview->recommend,
            ] : null,
        ];
    }

    /** @return array<int, array{date: string, slots: array<int, array{start: string, label: string}>}> */
    private function generateSlots(Staff $staff): array
    {
        $taken = Appointment::where('staff_id', $staff->getKey())
            ->where('status', 'planned')
            ->whereBetween('start_time', [now(), now()->addDays(7)->endOfDay()])
            ->pluck('start_time')
            ->map(fn ($dt) => $dt->format('Y-m-d H:i'))
            ->all();

        $takenSet = array_flip($taken);
        $days = [];

        for ($d = 0; $d < 7; $d++) {
            $day = now()->addDays($d)->startOfDay();
            $slots = [];

            for ($h = 9; $h < 17; $h++) {
                foreach ([0, 30] as $m) {
                    $start = $day->copy()->setHour($h)->setMinute($m)->setSecond(0);

                    if ($start->isPast()) {
                        continue;
                    }

                    $key = $start->format('Y-m-d H:i');

                    if (! isset($takenSet[$key])) {
                        $slots[] = [
                            'start' => $start->toIso8601String(),
                            'label' => $start->format('H:i'),
                        ];
                    }
                }
            }

            $days[] = [
                'date' => $day->toDateString(),
                'slots' => $slots,
            ];
        }

        return $days;
    }
}
