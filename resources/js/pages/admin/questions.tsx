import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, Circle, HelpCircle, Mail, User } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Администрирование', href: '/admin/dashboard' },
    { title: 'Вопросы', href: '/admin/questions' },
];

interface Question {
    id: number;
    name: string;
    email: string;
    question: string;
    answered: boolean;
    created_at: string;
    patient: { id: number; fio: string } | null;
    branch: { id: number; name: string } | null;
}

interface PaginatedQuestions {
    data: Question[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    questions: PaginatedQuestions;
}

export default function AdminQuestions({ questions }: Props) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;

    const toggleAnswered = (question: Question) => {
        router.patch(route('admin.questions.toggle-answered', question.id), {}, { preserveScroll: true });
    };

    const unanswered = questions.data.filter((q) => !q.answered).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Вопросы" />

            <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4">
                {flash?.success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950">
                            <HelpCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Вопросы пациентов</h1>
                            <p className="text-sm text-muted-foreground">Всего: {questions.total}</p>
                        </div>
                    </div>

                    {unanswered > 0 && (
                        <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 dark:border-orange-800 dark:bg-orange-950/40">
                            <Circle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                                {unanswered} без ответа
                            </span>
                        </div>
                    )}
                </div>

                {questions.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
                        <HelpCircle className="h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium text-foreground">Вопросов пока нет</p>
                        <p className="text-sm text-muted-foreground">Они появятся здесь, когда пациенты зададут вопросы</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {questions.data.map((question) => (
                            <div
                                key={question.id}
                                className={`rounded-xl border bg-card p-5 transition-colors ${
                                    question.answered
                                        ? 'border-border opacity-70'
                                        : 'border-violet-200 dark:border-violet-800'
                                }`}
                            >
                                {/* Top: sender info + status */}
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                                            {question.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-foreground">{question.name}</p>
                                                {question.patient && (
                                                    <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                                        <User className="h-3 w-3" />
                                                        {question.patient.fio}
                                                    </span>
                                                )}
                                            </div>
                                            <a
                                                href={`mailto:${question.email}`}
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                <Mail className="h-3 w-3" />
                                                {question.email}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(question.created_at).toLocaleDateString('ru-RU', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        {question.branch && (
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                {question.branch.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Question text */}
                                <p className="rounded-lg bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
                                    {question.question}
                                </p>

                                {/* Footer: reply link + mark answered */}
                                <div className="mt-3 flex items-center justify-between">
                                    <a
                                        href={`mailto:${question.email}?subject=Ответ на ваш вопрос`}
                                        className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                                    >
                                        <Mail className="h-3.5 w-3.5" />
                                        Ответить по email
                                    </a>

                                    <button
                                        onClick={() => toggleAnswered(question)}
                                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                            question.answered
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                        }`}
                                    >
                                        {question.answered ? (
                                            <>
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Отвечено
                                            </>
                                        ) : (
                                            <>
                                                <Circle className="h-3.5 w-3.5" />
                                                Отметить как отвечено
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
