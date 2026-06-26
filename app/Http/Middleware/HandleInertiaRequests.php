<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'avatar' => match (true) {
                        (bool) $request->user()->patient?->photo => asset('storage/'.$request->user()->patient->photo),
                        (bool) $request->user()->staff?->photo => asset('storage/'.$request->user()->staff->photo),
                        default => null,
                    },
                ]) : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'info' => $request->session()->get('info'),
                'error' => $request->session()->get('error'),
            ],
            'notifications' => $request->user() ? [
                'unread_count' => Notification::where('user_id', $request->user()->id)->where('is_read', false)->count(),
                'recent' => Notification::where('user_id', $request->user()->id)
                    ->orderByDesc('created_at')
                    ->limit(6)
                    ->get()
                    ->map(fn ($n) => [
                        'id' => $n->id,
                        'message' => $n->message,
                        'is_read' => $n->is_read,
                        'created_at' => $n->created_at->diffForHumans(),
                    ]),
            ] : null,
        ]);
    }
}
