import { Head, Link, useForm } from '@inertiajs/react';
import { Heart, Star } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface DoctorData {
    id: number;
    fio: string;
    position: string;
    contacts: string;
    specialization: string;
    user_name: string;
    user_email: string;
}

interface ReviewItem {
    id: number;
    rating: number;
    text: string | null;
    recommend: boolean;
    patient_name: string | null;
    created_at: string;
}

interface Props {
    doctor: DoctorData;
    rating_avg: number;
    rating_count: number;
    reviews: ReviewItem[];
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface EditForm {
    [key: string]: string;
    fio: string;
    position: string;
    contacts: string;
    specialization: string;
    email: string;
}

export default function AdminDoctorEdit({ doctor, rating_avg, rating_count, reviews }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Администрирование', href: '/admin/dashboard' },
        { title: 'Врачи', href: '/admin/doctors' },
        { title: doctor.fio, href: '#' },
    ];

    const { data, setData, patch, processing, errors } = useForm<EditForm>({
        fio: doctor.fio,
        position: doctor.position,
        contacts: doctor.contacts,
        specialization: doctor.specialization,
        email: doctor.user_email,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.doctors.update', doctor.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Редактировать — ${doctor.fio}`} />

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                <div className="border-b border-border bg-white px-6 py-5 dark:bg-card">
                    <div className="mx-auto flex max-w-2xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Редактировать врача</h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">Аккаунт: {doctor.user_name}</p>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 dark:bg-amber-950/40">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                {rating_count > 0 ? (
                                    <span className="text-sm text-amber-800 dark:text-amber-300">
                                        Рейтинг: <span className="font-bold">{rating_avg}</span> · {rating_count} {rating_count === 1 ? 'отзыв' : rating_count < 5 ? 'отзыва' : 'отзывов'}
                                    </span>
                                ) : (
                                    <span className="text-sm text-amber-800 dark:text-amber-300">Нет отзывов</span>
                                )}
                            </div>
                        </div>
                        <Link href="/admin/doctors" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            ← Назад
                        </Link>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                            <div className="border-b border-border bg-slate-50 px-5 py-3 dark:bg-muted/30">
                                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Аккаунт</h2>
                            </div>
                            <div className="p-5">
                                <label className="mb-1.5 block text-sm font-semibold text-foreground">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                            <div className="border-b border-border bg-slate-50 px-5 py-3 dark:bg-muted/30">
                                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Профиль врача</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">ФИО *</label>
                                    <input
                                        type="text"
                                        value={data.fio}
                                        onChange={(e) => setData('fio', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.fio && <p className="mt-1 text-xs text-red-600">{errors.fio}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Должность *</label>
                                    <input
                                        type="text"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Специализация</label>
                                    <input
                                        type="text"
                                        value={data.specialization}
                                        onChange={(e) => setData('specialization', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.specialization && <p className="mt-1 text-xs text-red-600">{errors.specialization}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Контакты</label>
                                    <input
                                        type="text"
                                        value={data.contacts}
                                        onChange={(e) => setData('contacts', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.contacts && <p className="mt-1 text-xs text-red-600">{errors.contacts}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link href="/admin/doctors" className="rounded-xl border border-border px-5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                Отмена
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Сохраняю...' : 'Сохранить изменения'}
                            </button>
                        </div>
                    </form>

                    {/* Отзывы врача */}
                    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                        <div className="flex items-center justify-between border-b border-border bg-slate-50 px-5 py-3 dark:bg-muted/30">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Отзывы пациентов</h2>
                            {rating_count > 0 && (
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-foreground">{rating_avg}</span>
                                    <span className="text-muted-foreground">· {rating_count}</span>
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            {reviews.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">У врача пока нет отзывов</p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((r) => (
                                        <div key={r.id} className="rounded-xl border border-border p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                                        {r.patient_name?.charAt(0).toUpperCase() ?? '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">{r.patient_name ?? 'Пациент'}</p>
                                                        <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className={`h-4 w-4 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            {r.text && <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>}
                                            {r.recommend && (
                                                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-500">
                                                    <Heart className="h-3.5 w-3.5 fill-rose-500" /> Рекомендует
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
