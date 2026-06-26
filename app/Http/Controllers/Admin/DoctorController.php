<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialization;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    public function index(): Response
    {
        $doctors = Staff::with(['user', 'specializations'])
            ->latest()
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'fio' => $s->fio,
                'position' => $s->position,
                'contacts' => $s->contacts,
                'email' => $s->user?->email ?? '—',
                'specializations' => $s->specializations->pluck('specialty')->join(', '),
            ]);

        return Inertia::render('admin/doctors/index', [
            'doctors' => $doctors,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/doctors/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'fio' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'contacts' => ['nullable', 'string', 'max:255'],
            'specialization' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'doctor',
        ]);

        $staff = Staff::create([
            'user_id' => $user->id,
            'fio' => $validated['fio'],
            'position' => $validated['position'],
            'contacts' => $validated['contacts'] ?? null,
        ]);

        if (! empty($validated['specialization'])) {
            Specialization::create([
                'staff_id' => $staff->id,
                'specialty' => $validated['specialization'],
            ]);
        }

        return redirect()->route('admin.doctors.index')->with('success', 'Врач успешно создан.');
    }

    public function edit(Staff $doctor): Response
    {
        $doctor->load(['user', 'specializations', 'doctorReviews.patient']);

        $reviews = $doctor->doctorReviews->sortByDesc('created_at')->values();

        return Inertia::render('admin/doctors/edit', [
            'doctor' => [
                'id' => $doctor->id,
                'fio' => $doctor->fio,
                'position' => $doctor->position,
                'contacts' => $doctor->contacts ?? '',
                'specialization' => $doctor->specializations->first()?->specialty ?? '',
                'user_name' => $doctor->user?->name ?? '',
                'user_email' => $doctor->user?->email ?? '',
            ],
            'rating_avg' => round((float) $reviews->avg('rating'), 1),
            'rating_count' => $reviews->count(),
            'reviews' => $reviews->map(fn ($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'text' => $r->text,
                'recommend' => $r->recommend,
                'patient_name' => $r->patient?->fio,
                'created_at' => $r->created_at->toIso8601String(),
            ])->all(),
        ]);
    }

    public function update(Request $request, Staff $doctor): RedirectResponse
    {
        $validated = $request->validate([
            'fio' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'contacts' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:users,email,'.($doctor->user_id ?? 0)],
            'specialization' => ['nullable', 'string', 'max:255'],
        ]);

        $doctor->update([
            'fio' => $validated['fio'],
            'position' => $validated['position'],
            'contacts' => $validated['contacts'] ?? null,
        ]);

        if ($doctor->user && ! empty($validated['email'])) {
            $doctor->user->update(['email' => $validated['email']]);
        }

        if (! empty($validated['specialization'])) {
            $spec = $doctor->specializations()->first();
            if ($spec) {
                $spec->update(['specialty' => $validated['specialization']]);
            } else {
                $doctor->specializations()->create(['specialty' => $validated['specialization']]);
            }
        }

        return redirect()->route('admin.doctors.index')->with('success', 'Данные врача обновлены.');
    }

    public function destroy(Staff $doctor): RedirectResponse
    {
        $user = $doctor->user;
        $doctor->delete();
        $user?->delete();

        return redirect()->route('admin.doctors.index')->with('success', 'Врач удалён.');
    }
}
