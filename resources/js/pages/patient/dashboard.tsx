import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    Bot,
    Building2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Grid3X3,
    Send,
    Shield,
    Stethoscope,
    User,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Главная', href: '/patient/dashboard' }];

const banners = [
    {
        id: 1,
        title: 'Платежи ОСМС',
        description: 'Проверьте свой страховой статус и произведите оплату онлайн',
        href: '/patient/osms',
        from: '#2563eb',
        to: '#1d4ed8',
    },
    {
        id: 2,
        title: 'Графики врачей',
        description: 'Запишитесь к нужному специалисту в удобное время',
        href: '/patient/doctors',
        from: '#0d9488',
        to: '#0f766e',
    },
    {
        id: 3,
        title: 'Результаты анализов',
        description: 'Ознакомьтесь с результатами ваших медицинских исследований',
        href: '/patient/history',
        from: '#16a34a',
        to: '#15803d',
    },
];

const menuItems = [
    { title: 'Поликлиника', icon: Building2, href: '/patient/clinic', color: '#2563eb', bg: '#eff6ff' },
    { title: 'Пакет ОСМС', icon: Shield, href: '/patient/osms', color: '#0d9488', bg: '#f0fdfa' },
    { title: 'Мои данные', icon: User, href: '/patient/profile/edit', color: '#7c3aed', bg: '#f5f3ff' },
    { title: 'Все рубрики', icon: Grid3X3, href: '/patient/history', color: '#64748b', bg: '#f8fafc' },
];

const quickActions = [
    { title: 'История визитов', icon: ClipboardList, href: '/patient/history', color: '#7c3aed', border: '#e9d5ff', hoverBg: '#f5f3ff' },
    { title: 'Запись к врачу', icon: Calendar, href: '/patient/doctors', color: '#16a34a', border: '#bbf7d0', hoverBg: '#f0fdf4' },
    { title: 'Список врачей', icon: Stethoscope, href: '/patient/doctors', color: '#2563eb', border: '#bfdbfe', hoverBg: '#eff6ff' },
];

interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    time: string;
}

const quickSymptoms = ['🤒 Температура', '🤧 Насморк', '😮‍💨 Горло болит', '🤕 Голова болит', '😴 Слабость'];

interface Clinic {
    id: number;
    name: string;
    address: string;
}

interface Patient {
    id: number;
    fio: string;
    birth_date: string | null;
    photo: string | null;
    profile_complete: boolean;
    osms_status: boolean;
    clinic: Clinic | null;
}

interface Props {
    patient: Patient;
    upcomingAppointments: unknown[];
    unreadNotificationsCount: number;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'Не указана';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function getFirstName(fio: string): string {
    const parts = fio.trim().split(' ');
    return parts[1] ?? parts[0] ?? fio;
}

function getCsrfToken(): string {
    const meta = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content;
    if (meta) return meta;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function PatientDashboard({ patient }: Props) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [aiQuery, setAiQuery] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const stopAutoPlay = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startAutoPlay = () => {
        stopAutoPlay();
        intervalRef.current = setInterval(() => {
            setCurrentSlide((s) => (s + 1) % banners.length);
        }, 5000);
    };

    useEffect(() => {
        startAutoPlay();
        return stopAutoPlay;
    }, []);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        startAutoPlay();
    };

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = aiQuery.trim();
        if (!query || aiLoading) return;

        const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const history = chatMessages.map((m) => ({ role: m.role, content: m.text }));

        setChatMessages((prev) => [...prev, { role: 'user', text: query, time: now }]);
        setAiQuery('');
        setAiLoading(true);

        try {
            const res = await fetch(route('patient.ai.ask'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({ query, history }),
            });

            const data = (await res.json()) as { answer?: string };
            const answerTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            setChatMessages((prev) => [
                ...prev,
                { role: 'assistant', text: data.answer ?? 'Не удалось получить ответ.', time: answerTime },
            ]);
        } catch {
            const errTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            setChatMessages((prev) => [
                ...prev,
                { role: 'assistant', text: 'Ошибка подключения. Попробуйте ещё раз.', time: errTime },
            ]);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Главная" />

            <div className="mx-auto flex max-w-7xl flex-col gap-5 p-4 lg:p-6">
                {/* Welcome */}
                <div className="py-1 text-center lg:text-left">
                    <h1 className="text-2xl font-bold text-foreground">
                        Добро пожаловать, {getFirstName(patient.fio)}!
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">Ваш личный кабинет медицинской клиники</p>
                </div>

                {/* Profile incomplete warning */}
                {!patient.profile_complete && (
                    <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Заполните профиль для записи к врачу
                        </p>
                        <Link
                            href="/patient/profile/edit"
                            className="text-sm font-semibold text-amber-700 underline dark:text-amber-400"
                        >
                            Заполнить
                        </Link>
                    </div>
                )}

                {/* Main 2-column layout */}
                <div className="grid gap-5 lg:grid-cols-3">

                {/* ── Left main column ── */}
                <div className="flex flex-col gap-5 lg:col-span-2">

                {/* AI Assistant — чат */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    {/* Шапка */}
                    <div className="flex items-center justify-between bg-blue-600 px-5 py-3">
                        <div className="flex items-center gap-3">
                            <Bot className="h-5 w-5 text-white" />
                            <div>
                                <p className="text-sm font-semibold text-white">AI-помощник по симптомам</p>
                                <p className="text-xs text-blue-100">Спросите о болезнях, симптомах и лечении</p>
                            </div>
                        </div>
                        {chatMessages.length > 0 && (
                            <button
                                onClick={() => setChatMessages([])}
                                className="text-xs text-blue-200 transition-colors hover:text-white"
                            >
                                Очистить
                            </button>
                        )}
                    </div>

                    {/* Область чата */}
                    <div className="flex h-52 flex-col gap-3 overflow-y-auto p-4">

                        {chatMessages.length === 0 && !aiLoading && (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                                <p className="max-w-xs text-xs text-muted-foreground">
                                    Опишите симптомы — я дам рекомендации. Для точного диагноза обратитесь к врачу.
                                </p>
                                <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                                    {quickSymptoms.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setAiQuery(s.replace(/^\S+\s*/, '').trim())}
                                            className="rounded-full border border-blue-200 px-2.5 py-0.5 text-xs text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    {msg.role === 'user' ? 'Я' : <Bot className="h-4 w-4 text-blue-600" />}
                                </div>
                                <div className={`flex max-w-[80%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-tr-sm bg-blue-600 text-white' : 'rounded-tl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'}`}>
                                        {msg.text}
                                    </div>
                                    <span className="px-1 text-[10px] text-muted-foreground">{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {aiLoading && (
                            <div className="flex gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                    <Bot className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
                                    <div className="flex gap-1">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Инпут */}
                    <div className="border-t border-border p-3">
                        <form onSubmit={handleAiSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                placeholder="Напишите симптомы..."
                                disabled={aiLoading}
                                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={aiLoading || !aiQuery.trim()}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {aiLoading ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Banner Carousel */}
                <div
                    className="relative overflow-hidden rounded-xl shadow-sm"
                    onMouseEnter={stopAutoPlay}
                    onMouseLeave={startAutoPlay}
                >
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {banners.map((banner) => (
                            <Link key={banner.id} href={banner.href} className="min-w-full">
                                <div
                                    className="relative px-8 py-10 text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${banner.from}, ${banner.to})`,
                                    }}
                                >
                                    <h2 className="mb-1 text-xl font-bold">{banner.title}</h2>
                                    <p className="text-sm text-white/80">{banner.description}</p>
                                    <span className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-medium">
                                        Подробнее →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <button
                        onClick={() => goToSlide((currentSlide - 1 + banners.length) % banners.length)}
                        className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white transition hover:bg-white/45"
                        aria-label="Предыдущий"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        onClick={() => goToSlide((currentSlide + 1) % banners.length)}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white transition hover:bg-white/45"
                        aria-label="Следующий"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`h-2 rounded-full transition-all ${
                                    i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'
                                }`}
                                aria-label={`Слайд ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Menu Grid — 4 items */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {menuItems.map((item) => (
                        <Link key={item.title} href={item.href}>
                            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:bg-muted/50">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-full"
                                    style={{ backgroundColor: item.bg }}
                                >
                                    <item.icon className="h-6 w-6" style={{ color: item.color }} />
                                </div>
                                <p className="text-sm font-medium leading-tight text-foreground">{item.title}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                </div>{/* ── end left main column ── */}

                {/* ── Right sidebar column ── */}
                <div className="flex flex-col gap-5">

                {/* Patient Info Card — blue gradient */}
                <div className="overflow-hidden rounded-xl shadow-sm">
                    <div
                        className="p-5 text-white"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                    >
                        <h2 className="mb-4 text-base font-semibold">Ваша информация</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="mb-1 text-xs text-blue-200">ФИО</p>
                                <p className="text-sm font-medium">{patient.fio}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-blue-200">Дата рождения</p>
                                <p className="text-sm font-medium">{formatDate(patient.birth_date)}</p>
                            </div>
                            {patient.clinic && (
                                <div className="col-span-2">
                                    <p className="mb-1 text-xs text-blue-200">Поликлиника</p>
                                    <p className="text-sm font-medium">{patient.clinic.name}</p>
                                </div>
                            )}
                            <div>
                                <p className="mb-1 text-xs text-blue-200">ОСМС</p>
                                <p
                                    className="text-sm font-semibold"
                                    style={{ color: patient.osms_status ? '#86efac' : '#fca5a5' }}
                                >
                                    {patient.osms_status ? 'Активен' : 'Не активен'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                        <Link key={action.title} href={action.href} className="h-full">
                            <div
                                className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-colors"
                                style={{
                                    borderColor: action.border,
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.backgroundColor = action.hoverBg;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
                                }}
                            >
                                <action.icon className="h-6 w-6" style={{ color: action.color }} />
                                <p className="text-xs font-medium leading-tight text-foreground">
                                    {action.title}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                </div>{/* ── end right sidebar column ── */}

                </div>{/* ── end 2-column layout ── */}
            </div>
        </AppLayout>
    );
}
