<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicDoctorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $doctors = Staff::with(['specializations', 'workPlaces.branch'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('fio', 'like', "%{$search}%")
                        ->orWhere('position', 'like', "%{$search}%")
                        ->orWhereHas('specializations', fn ($s) => $s->where('specialty', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'fio' => $s->fio,
                'position' => $s->position,
                'contacts' => $s->contacts,
                'specializations' => $s->specializations->pluck('specialty')->join(', '),
                'room' => $s->workPlaces->first()?->room,
                'initial' => mb_strtoupper(mb_substr($s->fio, 0, 1)),
                'photo' => $s->photo ? asset('storage/'.$s->photo) : null,
            ]);

        return Inertia::render('doctors/index', [
            'doctors' => $doctors,
            'search' => $search,
        ]);
    }

    public function show(Request $request, Staff $staff): Response
    {
        $staff->load(['specializations', 'workPlaces.branch', 'doctorReviews.patient']);

        $reviews = $staff->doctorReviews->sortByDesc('created_at')->values();
        $patient = $request->user()?->patient;

        return Inertia::render('doctors/show', [
            'doctor' => [
                'id' => $staff->id,
                'fio' => $staff->fio,
                'position' => $staff->position,
                'contacts' => $staff->contacts,
                'bio' => $staff->bio,
                'achievements' => $staff->achievements ?? [],
                'photo' => $staff->photo ? asset('storage/'.$staff->photo) : null,
                'initial' => mb_strtoupper(mb_substr($staff->fio, 0, 1)),
                'specializations' => $staff->specializations->pluck('specialty')->all(),
                'work_places' => $staff->workPlaces->map(fn ($wp) => [
                    'id' => $wp->id,
                    'room' => $wp->room,
                    'branch' => $wp->branch?->name,
                ])->all(),
            ],
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
            'can_review' => (bool) $patient,
            'my_review' => $patient
                ? $reviews->firstWhere('patient_id', $patient->id)?->only(['rating', 'text', 'recommend'])
                : null,
        ]);
    }

    public function storeReview(Request $request, Staff $staff): \Illuminate\Http\RedirectResponse
    {
        $patient = $request->user()->patient;

        abort_if(! $patient, 403, 'Доступно только пациентам.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['nullable', 'string', 'max:1000'],
            'recommend' => ['boolean'],
        ]);

        \App\Models\DoctorReview::updateOrCreate(
            ['patient_id' => $patient->id, 'staff_id' => $staff->id],
            [
                'rating' => $validated['rating'],
                'text' => $validated['text'] ?? null,
                'recommend' => $request->boolean('recommend'),
            ]
        );

        return back()->with('success', 'Спасибо за ваш отзыв!');
    }
}
