<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Throwable;

class AiAssistantController extends Controller
{
    public function ask(Request $request): JsonResponse
{
    $request->validate([
        'query'    => 'required|string|max:500',
        'history'  => 'array|max:20',
        'history.*.role'    => 'required|in:user,assistant',
        'history.*.content' => 'required|string|max:1000',
    ]);

    $query   = trim($request->string('query')->toString());
    $history = $request->input('history', []);
    $answer  = $this->getAnswer($query, $history);

    return response()->json(['answer' => $answer]);
}

private function getAnswer(string $query, array $history = []): string
{
    $deepseekKey = config('services.deepseek.key');
    if ($deepseekKey) {
        $answer = $this->callApi(
            'https://api.deepseek.com/v1/chat/completions',
            'deepseek-chat',
            $deepseekKey,
            $query,
            $history
        );
        if ($answer !== null) return $answer;
    }

    $openaiKey = config('services.openai.key');
    if ($openaiKey) {
        $answer = $this->callApi(
            'https://api.openai.com/v1/chat/completions',
            'gpt-3.5-turbo',
            $openaiKey,
            $query,
            $history
        );
        if ($answer !== null) return $answer;
    }

    return $this->localAnswer($query);
}

private function callApi(string $url, string $model, string $key, string $query, array $history = []): ?string
{
    try {
        // Собираем историю для контекста
        $messages = [
            [
                'role'    => 'system',
                'content' => 'Ты медицинский помощник клиники Baishev University. Давай краткие советы на русском языке (3-5 предложений). Помни контекст предыдущих сообщений. Всегда рекомендуй обратиться к врачу при серьёзных симптомах.',
            ],
        ];

        // Добавляем историю
        foreach ($history as $msg) {
            $messages[] = [
                'role'    => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        // Текущий вопрос
        $messages[] = ['role' => 'user', 'content' => $query];

        $response = Http::withToken($key)
            ->timeout(15)
            ->post($url, [
                'model'       => $model,
                'messages'    => $messages,
                'max_tokens'  => 400,
                'temperature' => 0.7,
            ]);

        if ($response->successful()) {
            return $response->json('choices.0.message.content');
        }
    } catch (Throwable) {}

    return null;
}

}
