import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChevronRight,
    Clock,
    HelpCircle,
    MapPin,
    MessageSquarePlus,
    Phone,
    PhoneCall,
    Shield,
    Star,
    Stethoscope,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: '/patient/dashboard' },
    { title: 'Поликлиника', href: '/patient/clinic' },
];

interface Department {
    id: number;
    name: string;
}

interface Clinic {
    id: number;
    name: string;
    address: string;
    phone: string | null;
    departments: Department[];
}

interface MyReview {
    id: number;
    rating: number;
    text: string | null;
}

interface AssignedDoctor {
    fio: string;
    position: string;
    room: string | null;
}

interface Props {
    clinic: Clinic | null;
    my_review: MyReview | null;
    assigned_doctor: AssignedDoctor | null;
}

const WORK_HOURS = { open: 8, close: 18 };

function getClinicStatus(): { isOpen: boolean; label: string } {
    const now = new Date();
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    if (day === 0 || day === 6) return { isOpen: false, label: 'Выходной' };
    if (mins >= WORK_HOURS.open * 60 && mins < WORK_HOURS.close * 60) return { isOpen: true, label: 'Сейчас открыто' };
    return { isOpen: false, label: 'Закрыто' };
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110"
                >
                    <Star className={`h-7 w-7 ${(hovered || value) >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`} />
                </button>
            ))}
        </div>
    );
}

export default function ClinicPage({ clinic, my_review, assigned_doctor }: Props) {
    const { flash } = usePage<SharedData & { flash: { success?: string } }>().props;

    const [phoneModalOpen, setPhoneModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);

    const phones = clinic?.phone ? clinic.phone.split(',').map((p) => p.trim()).filter(Boolean) : [];
    const status = getClinicStatus();

    const reviewForm = useForm({ rating: my_review?.rating ?? 0, text: my_review?.text ?? '' });
    const submitReview = () => {
        reviewForm.post(route('patient.reviews.store'), { onSuccess: () => setReviewModalOpen(false) });
    };
    const ratingLabel = ['', 'Очень плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'];

    const questionForm = useForm({ name: '', email: '', question: '' });
    const submitQuestion = () => {
        questionForm.post(route('patient.questions.store'), {
            onSuccess: () => {
                setQuestionModalOpen(false);
                questionForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Моя поликлиника" />

            {/* ── Phone modal ── */}
            {phoneModalOpen && clinic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPhoneModalOpen(false)}>
                    <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                                    <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Позвонить</p>
                                    <p className="text-xs text-muted-foreground">{clinic.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setPhoneModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {phones.length > 0 ? (
                                phones.map((phone, i) => (
                                    <a key={i} href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 transition-colors hover:bg-muted">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                                                <PhoneCall className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="font-medium text-foreground">{phone}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </a>
                                ))
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">Номера не указаны</p>
                            )}
                        </div>
                        <p className="mt-4 text-center text-xs text-muted-foreground">Нажмите на номер для звонка</p>
                    </div>
                </div>
            )}

            {/* ── Review modal ── */}
            {reviewModalOpen && clinic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReviewModalOpen(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                                    <Star className="h-4 w-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{my_review ? 'Изменить отзыв' : 'Оставить отзыв'}</p>
                                    <p className="text-xs text-muted-foreground">{clinic.name}</p>
                                </div>
                            </div>
                            <button onClick={() => { setReviewModalOpen(false); reviewForm.reset(); }} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 text-sm font-medium text-foreground">Оценка</p>
                                <div className="flex items-center gap-3">
                                    <StarRating value={reviewForm.data.rating} onChange={(v) => reviewForm.setData('rating', v)} />
                                    {reviewForm.data.rating > 0 && <span className="text-sm text-muted-foreground">{ratingLabel[reviewForm.data.rating]}</span>}
                                </div>
                            </div>
                            <textarea
                                value={reviewForm.data.text}
                                onChange={(e) => reviewForm.setData('text', e.target.value)}
                                placeholder="Расскажите о вашем опыте..."
                                rows={4}
                                className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                            />
                            <button
                                onClick={submitReview}
                                disabled={reviewForm.data.rating === 0 || reviewForm.processing}
                                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                            >
                                {reviewForm.processing ? 'Отправка...' : my_review ? 'Обновить отзыв' : 'Отправить отзыв'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Question modal ── */}
            {questionModalOpen && clinic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setQuestionModalOpen(false)}>
                    <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950">
                                    <HelpCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Задать вопрос</p>
                                    <p className="text-xs text-muted-foreground">{clinic.name}</p>
                                </div>
                            </div>
                            <button onClick={() => { setQuestionModalOpen(false); questionForm.reset(); }} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
                            <div className="space-y-3">
                                <input type="text" value={questionForm.data.name} onChange={(e) => questionForm.setData('name', e.target.value)}
                                    placeholder="Ваше имя"
                                    className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400" />
                                <input type="email" value={questionForm.data.email} onChange={(e) => questionForm.setData('email', e.target.value)}
                                    placeholder="Email для ответа"
                                    className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400" />
                                <div>
                                    <textarea value={questionForm.data.question} onChange={(e) => questionForm.setData('question', e.target.value.slice(0, 600))}
                                        placeholder="Ваш вопрос" rows={4}
                                        className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400" />
                                    <p className="mt-1 text-right text-xs text-muted-foreground">{questionForm.data.question.length}/600</p>
                                </div>
                                <button onClick={submitQuestion}
                                    disabled={!questionForm.data.name || !questionForm.data.email || !questionForm.data.question || questionForm.processing}
                                    className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                                    {questionForm.processing ? 'Отправка...' : 'Задать вопрос'}
                                </button>
                            </div>
                            <div className="hidden w-44 sm:block">
                                <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/40">
                                    <Shield className="mb-2 h-6 w-6 text-blue-500" />
                                    <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-300">Конфиденциально. Email нужен только для получения ответа.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Page content ── */}
            <div className="flex flex-col gap-4 p-4 lg:p-6">
                {flash?.success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        {flash.success}
                    </div>
                )}

                {!clinic ? (
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
                        <Stethoscope className="h-12 w-12 text-muted-foreground/50" />
                        <div>
                            <p className="font-medium text-foreground">Поликлиника не привязана</p>
                            <p className="mt-1 text-sm text-muted-foreground">Укажите свою поликлинику в профиле</p>
                        </div>
                        <Link href="/patient/profile/edit" className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
                            Заполнить профиль
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* ── Hero Banner with real photo ── */}
                        <div className="relative overflow-hidden rounded-2xl" style={{ height: 360 }}>
                            <img
                                src="/images/clinic.webp"
                                alt="Поликлиника"
                                className="absolute inset-0 h-full w-full object-cover object-top"
                            />
                            {/* gradient: dark at bottom for text, transparent at top for photo */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                            {/* Top badges */}
                            <div className="absolute inset-x-0 top-0 flex items-start justify-between px-6 pt-5">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                                    Ваша поликлиника
                                </div>
                                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
                                    status.isOpen ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'
                                }`}>
                                    <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${status.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                                    {status.label}
                                </div>
                            </div>

                            {/* Bottom: name + contacts */}
                            <div className="absolute inset-x-0 bottom-0 px-6 pb-5">
                                <h2 className="text-2xl font-bold text-white lg:text-3xl">{clinic.name}</h2>
                                <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 shrink-0 text-teal-300" />
                                        <span className="text-sm text-white/90">{clinic.address}</span>
                                    </div>
                                    {clinic.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 shrink-0 text-teal-300" />
                                            <span className="text-sm text-white/90">{clinic.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 shrink-0 text-teal-300" />
                                        <span className="text-sm text-white/90">Пн–Пт: 08:00 – 18:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 2-col grid ── */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                            {/* LEFT (2/3) */}
                            <div className="flex flex-col gap-4 lg:col-span-2">

                                {/* Hours + therapist card */}
                                <div className="rounded-xl border border-border bg-card">
                                    <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
                                        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-0.5">
                                            <span className="text-sm font-medium text-foreground">Пн–Пт: 08:00 – 18:00</span>
                                            <span className="text-xs text-muted-foreground">Сб–Вс: Выходной</span>
                                        </div>
                                        <div className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            status.isOpen
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                                        }`}>
                                            {status.label}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 px-5 py-3.5">
                                        <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        {assigned_doctor ? (
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                                <span className="text-sm font-medium text-foreground">Ваш терапевт: {assigned_doctor.fio}</span>
                                                {assigned_doctor.room && (
                                                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">Кабинет {assigned_doctor.room}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Участковый терапевт не назначен</span>
                                        )}
                                    </div>
                                </div>

                                {/* 3 Action buttons */}
                                <div className="grid grid-cols-3 gap-3">
                                    <Link href="/patient/doctors"
                                        className="flex flex-col items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-4 text-center transition-colors hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40">
                                        <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                                        <span className="text-xs font-medium leading-tight text-teal-700 dark:text-teal-300">Записаться к врачу</span>
                                    </Link>
                                    <Link href="/patient/doctors?home=1"
                                        className="flex flex-col items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-4 text-center transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40">
                                        <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs font-medium leading-tight text-blue-700 dark:text-blue-300">Вызвать врача на дом</span>
                                    </Link>
                                    <button onClick={() => setPhoneModalOpen(true)}
                                        className="flex flex-col items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-4 text-center transition-colors hover:bg-green-100 dark:border-green-800 dark:bg-green-950/40">
                                        <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        <span className="text-xs font-medium leading-tight text-green-700 dark:text-green-300">Позвонить в поликлинику</span>
                                    </button>
                                </div>

                                {/* Departments */}
                                {clinic.departments.length > 0 && (
                                    <div className="rounded-xl border border-border bg-card p-5">
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                            Отделения
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{clinic.departments.length}</span>
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {clinic.departments.map((dept) => (
                                                <div key={dept.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                                                    <span className="text-sm text-foreground">{dept.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT (1/3) */}
                            <div className="flex flex-col gap-4">

                                {/* Review card */}
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-amber-500" />
                                            <span className="text-sm font-semibold text-foreground">Ваша оценка</span>
                                        </div>
                                        <button onClick={() => setReviewModalOpen(true)}
                                            className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600">
                                            <MessageSquarePlus className="h-3.5 w-3.5" />
                                            {my_review ? 'Изменить' : 'Оставить отзыв'}
                                        </button>
                                    </div>
                                    {my_review ? (
                                        <>
                                            <div className="mb-2 flex items-center gap-2">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={`h-5 w-5 ${s <= my_review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                                                ))}
                                                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">{ratingLabel[my_review.rating]}</span>
                                            </div>
                                            {my_review.text && (
                                                <p className="text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/70">{my_review.text}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-amber-800/70 dark:text-amber-300/70">
                                            Вы ещё не оставили отзыв. Поделитесь своим впечатлением о поликлинике.
                                        </p>
                                    )}
                                </div>

                                {/* Question button */}
                                <button onClick={() => setQuestionModalOpen(true)}
                                    className="flex w-full items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-5 py-4 transition-colors hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/30">
                                    <div className="flex items-center gap-2.5">
                                        <HelpCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                        <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Задать вопрос поликлинике</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-violet-400" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
