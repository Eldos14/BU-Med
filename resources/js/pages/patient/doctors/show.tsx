import { Head, useForm, usePage } from '@inertiajs/react';
import { Heart, MapPin, Star, Stethoscope } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface Specialization {
    id: number;
    specialty: string;
}

interface Branch {
    id: number;
    name: string;
    address: string;
}

interface WorkPlace {
    id: number;
    room: string | null;
    branch: Branch;
}

interface Doctor {
    id: number;
    fio: string;
    position: string;
    photo: string | null;
    specializations: Specialization[];
    work_places: WorkPlace[];
}

interface TimeSlot {
    start: string;
    label: string;
}

interface DaySlots {
    date: string;
    slots: TimeSlot[];
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
    doctor: Doctor | null;
    no_doctor?: boolean;
    slots: DaySlots[];
    reviews: DoctorReviewItem[];
    rating_avg: number;
    rating_count: number;
    my_review: MyReview | null;
}

interface ReviewForm {
    [key: string]: string | number | boolean;
    rating: number;
    text: string;
    recommend: boolean;
}

interface BookingForm {
    [key: string]: string;
    staff_id: string;
    start_time: string;
    reason: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: '/patient/dashboard' },
    { title: 'Запись к врачу', href: '/patient/appointment' },
];

function getInitials(fio: string): string {
    return fio
        .trim()
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0] ?? '')
        .join('')
        .toUpperCase();
}

function formatDayTab(dateStr: string): { num: string; month: string; weekday: string } {
    const d = new Date(dateStr + 'T00:00:00');
    return {
        num: d.toLocaleDateString('ru-RU', { day: 'numeric' }),
        month: d.toLocaleDateString('ru-RU', { month: 'short' }),
        weekday: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
    };
}

function isToday(dateStr: string): boolean {
    return new Date(dateStr + 'T00:00:00').toDateString() === new Date().toDateString();
}

function formatSlotDateTime(iso: string): string {
    return new Date(iso).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function DoctorShow({ doctor, no_doctor, slots, reviews, rating_avg, rating_count, my_review }: Props) {
    const { auth } = usePage<SharedData>().props;

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [done, setDone] = useState(false);
    const [hover, setHover] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm<BookingForm>({
        staff_id: String(doctor?.id ?? ''),
        start_time: '',
        reason: '',
    });

    const reviewForm = useForm<ReviewForm>({
        rating: my_review?.rating ?? 0,
        text: my_review?.text ?? '',
        recommend: my_review?.recommend ?? false,
    });

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctor || reviewForm.data.rating < 1) return;
        reviewForm.post(route('doctors.reviews.store', doctor.id), { preserveScroll: true });
    };

    const formatReviewDate = (iso: string) =>
        new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

    const currentDay = slots[selectedDayIndex];

    const selectSlot = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        setData('start_time', slot.start);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('patient.appointments.store'), {
            onSuccess: () => {
                setDone(true);
                reset('reason');
                setSelectedSlot(null);
            },
        });
    };

    if (no_doctor || !doctor) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Запись к врачу" />
                <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm dark:border-amber-800 dark:bg-card">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                            <Stethoscope className="h-8 w-8 text-amber-500" />
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-foreground">Участковый врач не назначен</h2>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Запись к врачу ведётся через вашего участкового врача. Вам пока не назначен участковый врач — обратитесь в регистратуру поликлиники.
                        </p>
                        <a
                            href="/patient/clinic"
                            className="inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            Моя поликлиника
                        </a>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (done) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Запись создана" />
                <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-green-200 p-10 max-w-md w-full text-center">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Запись создана!</h2>
                        <p className="text-sm text-muted-foreground mb-6">Ваша запись к врачу успешно оформлена.</p>
                        <div className="flex gap-3 justify-center">
                            <a
                                href="/patient/history"
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
                            >
                                Моя история
                            </a>
                            <a
                                href="/patient/doctors"
                                className="rounded-xl border border-border hover:bg-muted px-5 py-2.5 text-sm font-medium transition-colors text-foreground"
                            >
                                К списку врачей
                            </a>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Запись к ${doctor.fio}`} />

            <div className="min-h-screen bg-slate-50 dark:bg-background pb-16">
                {/* Page header */}
                <div className="bg-white dark:bg-card border-b border-border px-4 py-5 mb-6">
                    <div className="mx-auto max-w-3xl flex items-center gap-4">
                        <a href="/patient/doctors" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                            ← Назад
                        </a>
                        <h1 className="text-lg font-bold text-foreground">Запись к врачу</h1>
                    </div>
                </div>

                <div className="mx-auto max-w-3xl px-4 flex flex-col gap-5">

                    {/* Important notice */}
                    <div className="rounded-xl border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/50 px-5 py-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <span className="font-semibold">Важно:</span> Запись будет создана на вас. Проверьте правильность информации перед отправкой.
                        </p>
                    </div>

                    {/* Patient info */}
                    <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Пациент</p>
                        <div className="rounded-xl border border-input bg-slate-50 dark:bg-muted/40 px-4 py-3 text-sm font-medium text-foreground">
                            {auth.user.name}
                        </div>
                    </div>

                    {/* Doctor info */}
                    <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Врач</p>
                        <div className="flex gap-4">
                            {doctor.photo ? (
                                <img src={`/storage/${doctor.photo}`} alt={doctor.fio}
                                    className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" />
                            ) : (
                                <div className="h-16 w-16 shrink-0 rounded-full flex items-center justify-center text-white text-xl font-bold"
                                    style={{ background: 'linear-gradient(135deg, #2a7de1, #17a2b8)' }}>
                                    {getInitials(doctor.fio)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-bold text-foreground">{doctor.fio}</p>
                                <p className="text-sm text-muted-foreground">{doctor.position}</p>
                                {doctor.specializations.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {doctor.specializations.map((s) => (
                                            <span
                                                key={s.id}
                                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300"
                                            >
                                                <Stethoscope className="h-3 w-3" />
                                                {s.specialty}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {doctor.work_places.length > 0 && (
                                    <div className="mt-2 space-y-0.5">
                                        {doctor.work_places.map((wp) => (
                                            <p key={wp.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                {wp.branch.name}{wp.room && `, каб. ${wp.room}`}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Date selection */}
                    <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                            Дата и время начала *
                        </p>

                        {/* Day tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
                            {slots.map((day, i) => {
                                const { num, month, weekday } = formatDayTab(day.date);
                                const active = i === selectedDayIndex;
                                return (
                                    <button
                                        key={day.date}
                                        onClick={() => {
                                            setSelectedDayIndex(i);
                                            setSelectedSlot(null);
                                            setData('start_time', '');
                                        }}
                                        className={`flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 text-center transition-colors ${
                                            active
                                                ? 'border-blue-500 bg-blue-600 text-white'
                                                : 'border-border bg-slate-50 dark:bg-muted/30 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span className={`text-xs ${active ? 'text-blue-200' : 'text-muted-foreground'}`}>
                                            {isToday(day.date) ? 'Сегодня' : weekday}
                                        </span>
                                        <span className={`text-base font-bold ${active ? 'text-white' : 'text-foreground'}`}>
                                            {num}
                                        </span>
                                        <span className={`text-xs ${active ? 'text-blue-200' : 'text-muted-foreground'}`}>
                                            {month}
                                        </span>
                                        <span className={`mt-1 text-[10px] font-medium ${
                                            active ? 'text-blue-100' : day.slots.length === 0 ? 'text-red-400' : 'text-green-500'
                                        }`}>
                                            {day.slots.length > 0 ? `${day.slots.length} слот.` : 'Занято'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Time slots */}
                        {!currentDay || currentDay.slots.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                                На этот день нет свободных слотов
                            </p>
                        ) : (
                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                                {currentDay.slots.map((slot) => {
                                    const isSelected = selectedSlot?.start === slot.start;
                                    return (
                                        <button
                                            key={slot.start}
                                            onClick={() => selectSlot(slot)}
                                            className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                                                    : 'border-border bg-slate-50 dark:bg-muted/30 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                        >
                                            {slot.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {errors.start_time && (
                            <p className="mt-2 text-xs text-red-600">{errors.start_time}</p>
                        )}
                    </div>

                    {/* Booking form */}
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border p-5">
                        {selectedSlot && (
                            <div className="mb-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-300 font-medium">
                                Выбрано время: {formatSlotDateTime(selectedSlot.start)}
                            </div>
                        )}

                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Причина визита *
                        </p>
                        <textarea
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="Например: консультация, осмотр, головная боль..."
                            rows={3}
                            className="w-full resize-none rounded-xl border border-input bg-slate-50 dark:bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.reason && (
                            <p className="mt-1 text-xs text-red-600">{errors.reason}</p>
                        )}

                        <div className="mt-5 flex gap-3">
                            <button
                                type="submit"
                                disabled={processing || !selectedSlot}
                                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white py-3 text-sm font-bold transition-colors shadow-sm"
                            >
                                {processing ? 'Записываю...' : selectedSlot ? 'Подтвердить запись' : 'Выберите время'}
                            </button>
                            <a
                                href="/patient/doctors"
                                className="rounded-xl border border-border hover:bg-muted px-5 py-3 text-sm font-medium text-foreground transition-colors text-center"
                            >
                                Отмена
                            </a>
                        </div>
                    </form>

                    {/* Поделитесь мнением */}
                    <div className="rounded-2xl bg-blue-600 dark:bg-blue-700 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="shrink-0">
                                <h2 className="text-lg font-extrabold leading-tight text-white">Поделитесь<br className="hidden sm:block" /> мнением</h2>
                                <div className="mt-3 flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onMouseEnter={() => setHover(s)}
                                            onMouseLeave={() => setHover(0)}
                                            onClick={() => reviewForm.setData('rating', s)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star className={`h-7 w-7 ${s <= (hover || reviewForm.data.rating) ? 'fill-white text-white' : 'text-blue-300'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={submitReview} className="flex-1">
                                <div className="rounded-2xl bg-white dark:bg-card p-4">
                                    <textarea
                                        value={reviewForm.data.text}
                                        onChange={(e) => reviewForm.setData('text', e.target.value)}
                                        placeholder="Опишите, как прошёл приём: помог ли специалист решить проблему, качество приёма (внимательность, сервис), будете ли ещё обращаться и рекомендовать специалиста"
                                        rows={4}
                                        className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                    />
                                    <div className="mt-2 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => reviewForm.setData('recommend', !reviewForm.data.recommend)}
                                            className={`flex items-center gap-1.5 text-sm transition-colors ${reviewForm.data.recommend ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-400'}`}
                                        >
                                            <Heart className={`h-4 w-4 ${reviewForm.data.recommend ? 'fill-rose-500' : ''}`} />
                                            Рекомендую
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={reviewForm.processing || reviewForm.data.rating < 1}
                                        className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {reviewForm.processing ? 'Отправка...' : my_review ? 'Обновить отзыв' : 'Отправить отзыв'}
                                    </button>
                                    {reviewForm.recentlySuccessful && <span className="text-sm text-blue-100">Сохранено ✓</span>}
                                    {reviewForm.data.rating < 1 && <span className="text-xs text-blue-200">Поставьте оценку звёздами</span>}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Список отзывов */}
                    {reviews.length > 0 && (
                        <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-base font-bold text-foreground">Отзывы пациентов</h2>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    <span className="font-semibold text-foreground">{rating_avg}</span>
                                    <span className="text-muted-foreground">· {rating_count}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {reviews.map((r) => (
                                    <div key={r.id} className="rounded-xl border border-border p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-xs font-bold text-blue-600 dark:text-blue-300">
                                                    {r.patient_name?.charAt(0).toUpperCase() ?? '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{r.patient_name ?? 'Пациент'}</p>
                                                    <p className="text-xs text-muted-foreground">{formatReviewDate(r.created_at)}</p>
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
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
