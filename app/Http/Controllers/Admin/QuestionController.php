<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function index(): Response
    {
        $questions = Question::with(['patient', 'branch'])
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/questions', [
            'questions' => $questions,
        ]);
    }

    public function markAnswered(Question $question): RedirectResponse
    {
        $question->update(['answered' => ! $question->answered]);

        return back()->with('success', $question->answered ? 'Отмечено как отвечено.' : 'Отметка снята.');
    }
}
