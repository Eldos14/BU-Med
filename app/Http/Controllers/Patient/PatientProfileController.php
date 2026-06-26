<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PatientProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $patient = $request->user()->patient;
        $clinics = Branch::orderBy('name')->get(['id', 'name', 'address']);

        return Inertia::render('patient/profile-edit', [
            'patient' => $patient,
            'clinics' => $clinics,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $patient = $request->user()->patient;

        $validated = $request->validate([
            'fio' => 'required|string|max:255',
            'iin' => 'nullable|string|size:12|unique:patients,iin,'.($patient->id ?? 'NULL'),
            'birth_date' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female',
            'address' => 'nullable|string|max:500',
            'contacts' => 'nullable|string|max:255',
            'clinic_id' => 'nullable|exists:branches,id',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($patient->photo) {
                Storage::disk('public')->delete($patient->photo);
            }
            $validated['photo'] = $request->file('photo')->store('patients/photos', 'public');
        }

        $isComplete = ! empty($validated['fio'])
            && ! empty($validated['iin'])
            && ! empty($validated['birth_date'])
            && ! empty($validated['gender'])
            && ! empty($validated['clinic_id']);

        $validated['profile_complete'] = $isComplete;

        $patient->update($validated);

        return to_route('patient.profile.edit')->with('success', 'Профиль успешно сохранён.');
    }
}
