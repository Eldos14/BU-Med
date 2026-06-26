import { Head, router, usePage } from '@inertiajs/react';
import { Globe, GlobeLock, MessageSquare, Star } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Администрирование', href: '/admin/dashboard' },
    { title: 'Отзывы', href: '/admin/reviews' },
];

interface Review {
    id: number;
    rating: number;
    text: string | null;
    show_on_main: boolean;
    created_at: string;
    patient: {
        id: number;
        fio: string;
    } | null;
    branch: {
        id: number;
        name: string;
    } | null;
}

interface PaginatedReviews {
    data: Review[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    reviews: PaginatedReviews;
}

const ratingLabel: Record<number, string> = {
    1: 'Очень плохо',
    2: 'Плохо',
    3: 'Нормально',
    4: 'Хорошо',
    5: 'Отлично',
};

const ratingColor: Record<number, string> = {
    1: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    2: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    4: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    5: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
};

function StarRow({ rating }: { rating: number }) {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
            ))}
        </div>
    );
}

export default function AdminReviews({ reviews }: Props) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;

    const toggleMain = (review: Review) => {
        router.patch(route('admin.reviews.toggle-main', review.id), {}, { preserveScroll: true });
    };

    const avgRating =
        reviews.data.length > 0
            ? (reviews.data.reduce((sum, r) => sum + r.rating, 0) / reviews.data.length).toFixed(1)
            : '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Отзывы" />

            <div className="mx-auto flex max-w-4xl flex-col gap-5 p-4">
                {flash?.success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                            <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Отзывы пациентов</h1>
                            <p className="text-sm text-muted-foreground">Всего: {reviews.total}</p>
                        </div>
                    </div>

                    {reviews.data.length > 0 && (
                        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-800 dark:bg-amber-950/40">
                            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                            <span className="text-lg font-bold text-amber-700 dark:text-amber-300">{avgRating}</span>
                            <span className="text-xs text-muted-foreground">средняя оценка</span>
                        </div>
                    )}
                </div>

                {reviews.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
                        <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium text-foreground">Отзывов пока нет</p>
                        <p className="text-sm text-muted-foreground">Они появятся здесь, когда пациенты оставят свои отзывы</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {reviews.data.map((review) => (
                            <div key={review.id} className="rounded-xl border border-border bg-card p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                                            {review.patient?.fio?.charAt(0).toUpperCase() ?? '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{review.patient?.fio ?? 'Неизвестный пациент'}</p>
                                            <p className="text-xs text-muted-foreground">{review.branch?.name ?? '—'}</p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ratingColor[review.rating]}`}>
                                            {ratingLabel[review.rating]}
                                        </span>
                                        <StarRow rating={review.rating} />
                                    </div>
                                </div>

                                {review.text && (
                                    <p className="mt-3 rounded-lg bg-muted/40 px-4 py-3 text-sm text-foreground">{review.text}</p>
                                )}

                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(review.created_at).toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>

                                    <button
                                        onClick={() => toggleMain(review)}
                                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                            review.show_on_main
                                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                        }`}
                                    >
                                        {review.show_on_main ? (
                                            <>
                                                <Globe className="h-3.5 w-3.5" />
                                                На главной
                                            </>
                                        ) : (
                                            <>
                                                <GlobeLock className="h-3.5 w-3.5" />
                                                На главную
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
