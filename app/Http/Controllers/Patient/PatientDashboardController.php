<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $patient = $user->patient->load('clinic');

        $upcomingAppointments = $patient->appointments()
            ->with('staff:id,fio,position')
            ->where('status', 'planned')
            ->where('start_time', '>=', now())
            ->orderBy('start_time')
            ->limit(3)
            ->get();

        $unreadNotificationsCount = $user->notifications()->unread()->count();

        return Inertia::render('patient/dashboard', [
            'patient' => $patient,
            'upcomingAppointments' => $upcomingAppointments,
            'unreadNotificationsCount' => $unreadNotificationsCount,
        ]);
    }
}
