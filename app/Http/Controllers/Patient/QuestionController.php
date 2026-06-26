<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $patient = $request->user()->patient;

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'question' => 'required|string|max:600',
        ]);

        Question::create([
            'patient_id' => $patient->id,
            'branch_id' => $patient->clinic_id,
            'name' => $request->name,
            'email' => $request->email,
            'question' => $request->question,
        ]);

        return to_route('patient.clinic')->with('success', 'Ваш вопрос отправлен. Ответ придёт на указанный email.');
    }
}
