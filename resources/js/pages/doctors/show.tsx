import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { ArrowLeft, Award, Calendar, GraduationCap, Heart, MapPin, Star, Stethoscope } from 'lucide-react';
import { useState } from 'react';

interface WorkPlace {
    id: number;
    room: string | null;
    branch: string | null;
}

interface Achievement {
    title: string;
    year: string;
    org: string;
    type: 'course' | 'certificate' | 'achievement';
}

interface Doctor {
    id: number;
    fio: string;
    position: string;
    contacts: string | null;
    bio: string | null;
    achievements: Achievement[];
    photo: string | null;
    initial: string;
    specializations: string[];
    work_places: WorkPlace[];
}

interface DoctorReviewItem {
    id: number;
    rating: number;
    text: string | null;
    recommend: boolean;
    patient_name: string | null;
    created_at: string;
}

interface MyReview {
    rating: number;
    text: string | null;
    recommend: boolean;
}

interface Props {
    doctor: Doctor;
    reviews: DoctorReviewItem[];
    rating_avg: number;
    rating_count: number;
    can_review: boolean;
    my_review: MyReview | null;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    course: { label: 'Курс', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    certificate: { label: 'Сертификат', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
    achievement: { label: 'Достижение', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface ReviewForm {
    [key: string]: string | number | boolean;
    rating: number;
    text: string;
    recommend: boolean;
}

export default function DoctorShow({ doctor, reviews, rating_avg, rating_count, can_review, my_review }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [hover, setHover] = useState(0);

    const { data, setData, post, processing, recentlySuccessful } = useForm<ReviewForm>({
        rating: my_review?.rating ?? 0,
        text: my_review?.text ?? '',
        recommend: my_review?.recommend ?? false,
    });

    const isPatient = auth.user?.role === 'patient';
    const bookHref = auth.user
        ? (isPatient ? route('patient.appointment') : route('dashboard'))
        : route('register');

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.rating < 1) return;
        post(route('doctors.reviews.store', doctor.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title={`${doctor.fio} — BaishevMed`} />

            <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">

                {/* ── Header ── */}
                <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
                    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href={route('home')} className="flex items-center gap-2.5 text-slate-700 transition-colors hover:text-blue-600 dark:text-slate-200">
                            <ArrowLeft className="h-4 w-4" />
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
                                    <img src="/images/baishev_university_logo.png" alt="" className="h-full w-full object-contain" />
                                </div>
                                <span className="text-base font-bold text-slate-900 dark:text-white">BaishevMed</span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Link href={bookHref} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                                    Личный кабинет
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                                        Войти
                                    </Link>
                                    <Link href={route('register')} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                                        Регистрация
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* ── Левая колонка ── */}
                        <div className="flex flex-col gap-6 lg:col-span-2">

                            {/* Карточка врача */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
                                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                                    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl font-bold text-white ring-4 ring-slate-100 dark:ring-slate-800">
                                        {doctor.initial}
                                        {doctor.photo && (
                                            <img src={doctor.photo} alt={doctor.fio} className="absolute inset-0 h-full w-full rounded-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1 text-center sm:text-left">
                                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{doctor.fio}</h1>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{doctor.position}</p>

                                        <div className="mt-2 flex items-center justify-center gap-1.5 sm:justify-start">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={`h-4 w-4 ${rating_count > 0 && s <= Math.round(rating_avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                                ))}
                                            </div>
                                            {rating_count > 0 ? (
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{rating_avg}</span> · {rating_count} {rating_count === 1 ? 'отзыв' : rating_count < 5 ? 'отзыва' : 'отзывов'}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-slate-500">Нет отзывов</span>
                                            )}
                                        </div>

                                        {doctor.specializations.length > 0 && (
                                            <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                                                {doctor.specializations.map((s) => (
                                                    <span key={s} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                                        <Stethoscope className="h-3 w-3" />
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Информация */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Информация
                                </h2>

                                {doctor.bio ? (
                                    <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        {doctor.bio}
                                    </div>
                                ) : (
                                    <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                        Врач пока не добавил информацию о себе
                                    </p>
                                )}

                                {doctor.achievements.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            Образование, курсы и достижения
                                        </h3>
                                        <ul className="space-y-3">
                                            {doctor.achievements.map((a, i) => {
                                                const type = TYPE_LABELS[a.type] ?? TYPE_LABELS.achievement;
                                                return (
                                                    <li key={i} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/60 dark:bg-slate-800/40">
                                                        <span className={`mt-0.5 inline-flex h-fit shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${type.color}`}>
                                                            {type.label}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.title}</p>
                                                            {(a.org || a.year) && (
                                                                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                                                                    {[a.org, a.year].filter(Boolean).join(' · ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Поделитесь мнением */}
                            <div className="rounded-3xl bg-blue-600 p-6 shadow-md dark:bg-blue-700">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                    <div className="shrink-0">
                                        <h2 className="text-lg font-extrabold leading-tight text-white">Поделитесь<br className="hidden sm:block" /> мнением</h2>
                                        <div className="mt-3 flex gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    disabled={!can_review}
                                                    onMouseEnter={() => setHover(s)}
                                                    onMouseLeave={() => setHover(0)}
                                                    onClick={() => setData('rating', s)}
                                                    className="transition-transform enabled:hover:scale-110 disabled:cursor-not-allowed"
                                                >
                                                    <Star className={`h-7 w-7 ${s <= (hover || data.rating) ? 'fill-white text-white' : 'text-blue-300'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <form onSubmit={submitReview} className="flex-1">
                                        <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
                                            <textarea
                                                value={data.text}
                                                onChange={(e) => setData('text', e.target.value)}
                                                disabled={!can_review}
                                                placeholder="Опишите, как прошёл приём: помог ли специалист решить проблему, качество приёма (внимательность, сервис), будете ли ещё обращаться и рекомендовать специалиста"
                                                rows={4}
                                                className="w-full resize-none bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-300"
                                            />
                                            <div className="mt-2 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    disabled={!can_review}
                                                    onClick={() => setData('recommend', !data.recommend)}
                                                    className={`flex items-center gap-1.5 text-sm transition-colors disabled:cursor-not-allowed ${data.recommend ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}
                                                >
                                                    <Heart className={`h-4 w-4 ${data.recommend ? 'fill-rose-500' : ''}`} />
                                                    Рекомендую
                                                </button>
                                            </div>
                                        </div>

                                        {can_review ? (
                                            <div className="mt-3 flex items-center gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={processing || data.rating < 1}
                                                    className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {processing ? 'Отправка...' : my_review ? 'Обновить отзыв' : 'Отправить отзыв'}
                                                </button>
                                                {recentlySuccessful && <span className="text-sm text-blue-100">Сохранено ✓</span>}
                                            </div>
                                        ) : (
                                            <p className="mt-3 text-xs text-blue-100">
                                                Чтобы оставить отзыв,{' '}
                                                <Link href={route('login')} className="font-semibold underline">войдите</Link>{' '}
                                                как пациент.
                                            </p>
                                        )}
                                    </form>
                                </div>
                            </div>

                            {/* Список отзывов */}
                            {reviews.length > 0 && (
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
                                    <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Отзывы пациентов</h2>
                                    <div className="space-y-4">
                                        {reviews.map((r) => (
                                            <div key={r.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700/60">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                                            {r.patient_name?.charAt(0).toUpperCase() ?? '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.patient_name ?? 'Пациент'}</p>
                                                            <p className="text-xs text-slate-400">{formatDate(r.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} className={`h-4 w-4 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {r.text && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{r.text}</p>}
                                                {r.recommend && (
                                                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-500">
                                                        <Heart className="h-3.5 w-3.5 fill-rose-500" /> Рекомендует
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Правая колонка: запись ── */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
                                <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Запись на приём</h2>

                                {doctor.work_places.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        {doctor.work_places.map((wp) => (
                                            <p key={wp.id} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                                <span>{wp.branch ?? 'Поликлиника'}{wp.room && `, каб. ${wp.room}`}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}

                                <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/40">
                                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Бесплатно</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-500">Приём для студентов и сотрудников Baishev University</p>
                                </div>

                                <Link
                                    href={bookHref}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                                >
                                    <Calendar className="h-4 w-4" />
                                    {isPatient ? 'К записи' : 'Записаться'}
                                </Link>

                                {!auth.user && (
                                    <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
                                        Для записи нужна регистрация
                                    </p>
                                )}
                                {isPatient && (
                                    <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
                                        Запись ведётся через вашего участкового врача
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-600">
                    © {new Date().getFullYear()} BaishevMed — Baishev University
                </footer>
            </div>
        </>
    );
}
