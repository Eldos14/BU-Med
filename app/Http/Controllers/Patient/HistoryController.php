<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $patient = $request->user()->patient;

        $appointments = $patient->appointments()
            ->with('staff:id,fio,position')
            ->orderByDesc('start_time')
            ->paginate(15);

        return Inertia::render('patient/history', [
            'appointments' => $appointments,
        ]);
    }
}
