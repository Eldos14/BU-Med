<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class PatientEmailController extends Controller
{
    public function requestChange(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($request->user()->id),
            ],
        ]);

        $code = (string) random_int(100000, 999999);

        session([
            'email_change_code' => $code,
            'email_change_new' => $request->email,
            'email_change_expires' => now()->addMinutes(10)->timestamp,
        ]);

        Mail::raw(
            "Ваш код подтверждения смены email: {$code}\n\nКод действителен 10 минут.",
            function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('Подтверждение смены email — BaishevMed');
            }
        );

        return back()->with('email_code_sent', true);
    }

    public function confirmChange(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $storedCode = session('email_change_code');
        $newEmail = session('email_change_new');
        $expires = session('email_change_expires');

        if (! $storedCode || ! $newEmail || ! $expires) {
            return back()->withErrors(['code' => 'Код не найден. Запросите новый код.']);
        }

        if (now()->timestamp > $expires) {
            session()->forget(['email_change_code', 'email_change_new', 'email_change_expires']);

            return back()->withErrors(['code' => 'Код истёк. Запросите новый код.']);
        }

        if ($request->code !== $storedCode) {
            return back()->withErrors(['code' => 'Неверный код подтверждения.']);
        }

        $request->user()->update(['email' => $newEmail]);
        session()->forget(['email_change_code', 'email_change_new', 'email_change_expires']);

        return back()->with('email_changed', true);
    }
}
