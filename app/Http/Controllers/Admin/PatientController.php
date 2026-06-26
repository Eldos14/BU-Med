<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Staff;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(): Response
    {
        $patients = Patient::with(['user', 'districtDoctor'])
            ->latest()
            ->paginate(20)
            ->through(fn ($p) => [
                'id' => $p->id,
                'fio' => $p->fio,
                'email' => $p->user?->email ?? '—',
                'contacts' => $p->contacts ?? '—',
                'birth_date' => $p->birth_date?->format('d.m.Y') ?? '—',
                'osms_status' => $p->osms_status,
                'district_doctor' => $p->districtDoctor?->fio,
                'created_at' => $p->created_at->format('d.m.Y'),
            ]);

        return Inertia::render('admin/patients/index', [
            'patients' => $patients,
        ]);
    }

    public function show(Patient $patient): Response
    {
        $patient->load(['user', 'districtDoctor', 'clinic']);

        $appointments = $patient->appointments()
            ->with('staff')
            ->latest('start_time')
            ->limit(20)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'doctor_name' => $a->staff?->fio ?? '—',
                'start_time' => $a->start_time->format('d.m.Y H:i'),
                'reason' => $a->reason,
                'status' => $a->status,
            ]);

        $doctors = Staff::orderBy('fio')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'fio' => $s->fio,
                'position' => $s->position,
            ]);

        return Inertia::render('admin/patients/show', [
            'patient' => [
                'id' => $patient->id,
                'fio' => $patient->fio,
                'email' => $patient->user?->email ?? '—',
                'contacts' => $patient->contacts ?? '—',
                'birth_date' => $patient->birth_date?->format('d.m.Y') ?? '—',
                'gender' => $patient->gender,
                'address' => $patient->address ?? '—',
                'iin' => $patient->iin ?? '—',
                'osms_status' => $patient->osms_status,
                'osms_end_date' => $patient->osms_end_date?->format('d.m.Y') ?? '—',
                'created_at' => $patient->created_at->format('d.m.Y'),
                'clinic_name' => $patient->clinic?->name,
                'district_doctor_id' => $patient->district_doctor_id,
                'district_doctor_fio' => $patient->districtDoctor?->fio,
            ],
            'appointments' => $appointments,
            'doctors' => $doctors,
        ]);
    }

    public function assignDoctor(Request $request, Patient $patient): RedirectResponse
    {
        $validated = $request->validate([
            'district_doctor_id' => ['nullable', 'exists:staff,id'],
        ]);

        $patient->update(['district_doctor_id' => $validated['district_doctor_id']]);

        return back()->with('success', 'Участковый врач обновлён.');
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        $user = $patient->user;
        $patient->delete();
        $user?->delete();

        return redirect()->route('admin.patients.index')->with('success', 'Пациент удалён.');
    }
}
