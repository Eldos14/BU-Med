<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        $reviews = Review::with(['patient', 'branch'])
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/reviews', [
            'reviews' => $reviews,
        ]);
    }

    public function toggleMain(Review $review): RedirectResponse
    {
        $review->update(['show_on_main' => ! $review->show_on_main]);

        return back()->with('success', $review->show_on_main
            ? 'Отзыв добавлен на главную страницу.'
            : 'Отзыв убран с главной страницы.'
        );
    }
}
