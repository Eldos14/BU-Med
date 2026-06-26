<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OsmsController extends Controller
{
    public function index(Request $request): Response
    {
        $patient = $request->user()->patient;

        return Inertia::render('patient/osms', [
            'osms_status' => $patient->osms_status,
            'osms_end_date' => $patient->osms_end_date?->format('d.m.Y'),
            'osms_type' => $patient->osms_type,
            'patient_fio' => $patient->fio,
        ]);
    }
}
