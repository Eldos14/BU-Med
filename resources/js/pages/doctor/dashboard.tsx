import { Head, router, usePage } from '@inertiajs/react';
import { CalendarClock, Inbox, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BarChart, DonutChart } from '@/components/charts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Панель врача', href: '/doctor/dashboard' }];

interface AppointmentRow {
    id: number;
    patient_name: string;
    start_time: string;
    reason: string | null;
    status: 'planned' | 'completed' | 'cancelled';
}

interface PatientRow {
    id: number;
    name: string;
    last_visit: string;
    status: string;
}

interface Stats {
    patient_count: number;
    new_requests: number;
    available_slots: number;
    rating_avg: number;
    rating_count: number;
}

interface Slice {
    label: string;
    value: number;
    color: string;
}

interface DayBar {
    label: string;
    date: string;
    value: number;
}

interface Props {
    doctor_name: string;
    stats: Stats;
    appointments_7d: DayBar[];
    status_breakdown: Slice[];
    appointment_requests: AppointmentRow[];
    upcoming_appointments: AppointmentRow[];
    patients: PatientRow[];
}

const statusLabel: Record<string, string> = {
    planned: 'Запланировано',
    completed: 'Принято',
    cancelled: 'Отменено',
};

const statusStyle: Record<string, string> = {
    planned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
};

export default function DoctorDashboard({ doctor_name, stats, appointments_7d, status_breakdown, appointment_requests, upcoming_appointments, patients }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [toast, setToast] = useState<string | null>(null);
    const [processing, setProcessing] = useState<number | null>(null);

    useEffect(() => {
        const msg = flash.success ?? flash.error ?? null;
        if (msg) {
            setToast(msg);
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash.success, flash.error]);

    const handleAccept = (id: number) => {
        setProcessing(id);
        router.patch(route('doctor.appointments.accept', id), {}, {
            onFinish: () => setProcessing(null),
        });
    };

    const handleCancel = (id: number) => {
        if (!confirm('Отменить запись?')) { return; }
        setProcessing(id);
        router.patch(route('doctor.appointments.cancel', id), {}, {
            onFinish: () => setProcessing(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Панель врача" />

            {toast && (
                <div className="fixed right-4 top-4 z-50 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                    {toast}
                </div>
            )}

            <div className="min-h-screen bg-slate-50 p-4 dark:bg-background lg:p-6">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Здравствуйте, {doctor_name} 👋</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Обзор вашей практики, приёмов и отзывов.</p>
                    </div>

                    {/* Stat cards (gradient) */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {[
                            { label: 'Пациентов в практике', value: stats.patient_count, icon: Users, from: 'from-blue-500', to: 'to-indigo-600' },
                            { label: 'Новых запросов', value: stats.new_requests, icon: Inbox, from: 'from-amber-500', to: 'to-orange-600' },
                            { label: 'Доступных смен', value: stats.available_slots, icon: CalendarClock, from: 'from-emerald-500', to: 'to-teal-600' },
                            { label: stats.rating_count > 0 ? `Рейтинг · ${stats.rating_count} отз.` : 'Рейтинг', value: stats.rating_count > 0 ? stats.rating_avg : '—', icon: Star, from: 'from-violet-500', to: 'to-fuchsia-600' },
                        ].map((s) => (
                            <div key={s.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.from} ${s.to} p-5 text-white shadow-sm`}>
                                <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                                <s.icon className="h-6 w-6 text-white/90" />
                                <p className="mt-4 text-3xl font-extrabold tabular-nums">{s.value}</p>
                                <p className="text-xs text-white/80">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card lg:col-span-2">
                            <div className="mb-4">
                                <h2 className="font-bold text-foreground">Приёмы за 7 дней</h2>
                                <p className="text-xs text-muted-foreground">Ваши приёмы по дням</p>
                            </div>
                            <BarChart data={appointments_7d} color="#6366f1" height={200} />
                        </div>
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                            <h2 className="mb-4 font-bold text-foreground">Приёмы по статусу</h2>
                            <DonutChart data={status_breakdown} size={150} />
                        </div>
                    </div>

                    {/* Appointment Requests */}
                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                        <div className="bg-blue-600 px-6 py-4">
                            <h2 className="text-lg font-bold text-white">Запросы на приём</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[620px]">
                                <thead>
                                    <tr className="border-b border-border bg-slate-50 dark:bg-muted/30">
                                        <th className="px-5 py-3 text-left text-sm font-bold text-foreground">Пациент</th>
                                        <th className="px-5 py-3 text-left text-sm font-bold text-foreground">Дата</th>
                                        <th className="px-5 py-3 text-left text-sm font-bold text-foreground">Причина</th>
                                        <th className="px-5 py-3 text-left text-sm font-bold text-foreground">Статус</th>
                                        <th className="px-5 py-3 text-left text-sm font-bold text-foreground">Действие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointment_requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                                                Новых запросов нет.
                                            </td>
                                        </tr>
                                    ) : (
                                        appointment_requests.map((appt) => (
                                            <tr key={appt.id} className="border-t border-border transition-colors hover:bg-slate-50/60 dark:hover:bg-muted/20">
                                                <td className="px-5 py-3.5 text-sm font-medium text-foreground">{appt.patient_name}</td>
                                                <td className="px-5 py-3.5 text-sm whitespace-nowrap text-foreground">{appt.start_time}</td>
                                                <td className="px-5 py-3.5 text-sm text-foreground">{appt.reason ?? '—'}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[appt.status]}`}>
                                                        {statusLabel[appt.status]}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAccept(appt.id)}
                                                            disabled={processing === appt.id}
                                                            className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                                                        >
                                                            Принять
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(appt.id)}
                                                            disabled={processing === appt.id}
                                                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                                                        >
                                                            Отменить
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    

                   
                    {/* Schedule placeholder */}
                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                        <div className="border-b border-border px-6 py-4">
                            <h2 className="text-lg font-bold text-foreground">Ближайшее расписание</h2>
                        </div>
                        <div className="px-6 py-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                Расписание не заполнено. Администратор может создать доступные смены на странице расписания.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
