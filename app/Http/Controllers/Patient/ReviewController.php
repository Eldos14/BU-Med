<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $patient = $request->user()->patient;

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'text' => 'nullable|string|max:1000',
        ]);

        Review::updateOrCreate(
            [
                'patient_id' => $patient->id,
                'branch_id' => $patient->clinic_id,
            ],
            [
                'rating' => $request->rating,
                'text' => $request->text,
            ]
        );

        return to_route('patient.clinic')->with('success', 'Спасибо за ваш отзыв!');
    }
}
