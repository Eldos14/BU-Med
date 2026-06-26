<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClinicController extends Controller
{
    public function index(Request $request): Response
    {
        $patient = $request->user()->patient;
        $clinic = $patient->clinic?->load('departments');

        $myReview = $clinic
            ? Review::where('patient_id', $patient->id)
                ->where('branch_id', $clinic->id)
                ->first()
            : null;

        $assignedDoctor = null;
        if ($patient->district_doctor_id) {
            $doctor = $patient->districtDoctor;
            if ($doctor) {
                $room = $doctor->workPlaces()
                    ->when($clinic, fn ($q) => $q->where('branch_id', $clinic->id))
                    ->first()?->room;

                $assignedDoctor = [
                    'fio' => $doctor->fio,
                    'position' => $doctor->position,
                    'room' => $room,
                ];
            }
        }

        return Inertia::render('patient/clinic', [
            'clinic' => $clinic,
            'my_review' => $myReview,
            'assigned_doctor' => $assignedDoctor,
        ]);
    }
}
