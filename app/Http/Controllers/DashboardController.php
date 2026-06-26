<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $user = auth()->user();

        if ($user->isPatient()) {
            return redirect()->route('patient.dashboard');
        }

        if ($user->isDoctor()) {
            return redirect()->route('doctor.dashboard');
        }

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        $patients = Patient::all();

        return Inertia::render('dashboard', [
            'projectTitle' => 'Медицинская система Baishev_med',
            'userRole' => 'Admin',
            'balance' => 15550,
            'patients' => $patients,
        ]);
    }
}
