<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        $user = auth()->user();
        $staff = $user->staff;

        abort_if(! $staff, 403, 'Профиль врача не найден.');

        $staff->load(['specializations', 'workPlaces.branch']);

        return Inertia::render('doctor/profile', [
            'staff' => [
                'id' => $staff->id,
                'fio' => $staff->fio,
                'position' => $staff->position,
                'contacts' => $staff->contacts,
                'bio' => $staff->bio,
                'achievements' => $staff->achievements ?? [],
                'photo' => $staff->photo ? asset('storage/'.$staff->photo) : null,
                'specialization' => $staff->specializations->pluck('specialty')->implode(', '),
                'work_place' => $staff->workPlaces
                    ->map(fn ($wp) => ($wp->branch->name ?? '').($wp->room ? ', каб. '.$wp->room : ''))
                    ->filter()
                    ->implode('; '),
            ],
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $staff = auth()->user()->staff;
        $user = auth()->user();

        abort_if(! $staff, 403, 'Профиль врача не найден.');

        $tab = $request->input('tab', 'personal');

        if ($tab === 'personal') {
            $request->validate([
                'fio' => ['required', 'string', 'max:255'],
                'position' => ['required', 'string', 'max:255'],
                'contacts' => ['nullable', 'string', 'max:255'],
                'photo' => ['nullable', 'image', 'max:2048'],
            ]);

            $updates = [
                'fio' => $request->fio,
                'position' => $request->position,
                'contacts' => $request->contacts,
            ];

            if ($request->hasFile('photo')) {
                if ($staff->photo) {
                    Storage::disk('public')->delete($staff->photo);
                }
                $updates['photo'] = $request->file('photo')->store('staff/photos', 'public');
            }

            $staff->update($updates);

            return back()->with('success', 'Личные данные обновлены.');
        }

        if ($tab === 'password') {
            $request->validate([
                'current_password' => ['required', 'string'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            if (! Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'Неверный текущий пароль.']);
            }

            $user->update(['password' => Hash::make($request->password)]);

            return back()->with('success', 'Пароль изменён.');
        }

        if ($tab === 'achievements') {
            $request->validate([
                'bio' => ['nullable', 'string', 'max:800'],
                'achievements' => ['nullable', 'array'],
                'achievements.*.title' => ['required', 'string', 'max:255'],
                'achievements.*.year' => ['nullable', 'string', 'max:10'],
                'achievements.*.org' => ['nullable', 'string', 'max:255'],
                'achievements.*.type' => ['required', 'in:course,certificate,achievement'],
            ]);

            $staff->update([
                'bio' => $request->bio,
                'achievements' => $request->achievements ?? [],
            ]);

            return back()->with('success', 'Достижения сохранены.');
        }

        return back();
    }
}
