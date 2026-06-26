import { Head, Link } from '@inertiajs/react';
import { Heart, Star } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Панель врача', href: '/doctor/dashboard' },
    { title: 'Пациенты', href: '/doctor/patients' },
];

interface Patient {
    id: number;
    name: string;
    last_visit: string;
    visit_count: number;
    review_rating: number | null;
    review_text: string | null;
    review_recommend: boolean;
}

interface Props {
    patients: Patient[];
    rating_avg: number;
    rating_count: number;
}

export default function DoctorPatients({ patients, rating_avg, rating_count }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Пациенты врача" />

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                {/* Header */}
                <div className="border-b border-border bg-white px-6 py-6 dark:bg-card">
                    <div className="mx-auto flex max-w-4xl items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Пациенты врача</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Список пациентов, записанных на ваши приёмы.</p>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 dark:bg-amber-950/40">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                {rating_count > 0 ? (
                                    <span className="text-sm text-amber-800 dark:text-amber-300">
                                        Ваш рейтинг: <span className="font-bold">{rating_avg}</span> · {rating_count} {rating_count === 1 ? 'отзыв' : rating_count < 5 ? 'отзыва' : 'отзывов'}
                                    </span>
                                ) : (
                                    <span className="text-sm text-amber-800 dark:text-amber-300">Пока нет отзывов</span>
                                )}
                            </div>
                        </div>
                        <Link href="/doctor/dashboard" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            ← Назад
                        </Link>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl p-6">
                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Пациент</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Последний приём</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Визитов</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Отзыв пациента</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">История</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                                                У вас пока нет пациентов.
                                            </td>
                                        </tr>
                                    ) : (
                                        patients.map((p) => (
                                            <tr key={p.id} className="border-t border-border transition-colors hover:bg-slate-50/60 dark:hover:bg-muted/20">
                                                <td className="px-6 py-4 text-sm font-medium text-foreground">{p.name}</td>
                                                <td className="px-6 py-4 text-sm text-foreground">{p.last_visit}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                                        {p.visit_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {p.review_rating ? (
                                                        <div className="max-w-[220px]">
                                                            <div className="flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <Star key={s} className={`h-3.5 w-3.5 ${s <= p.review_rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                                                ))}
                                                                {p.review_recommend && <Heart className="ml-1 h-3.5 w-3.5 fill-rose-500 text-rose-500" />}
                                                            </div>
                                                            {p.review_text && (
                                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.review_text}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('doctor.patients.history', p.id)}
                                                        className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-slate-50 dark:text-blue-400 dark:hover:bg-muted/30"
                                                    >
                                                        Открыть
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
