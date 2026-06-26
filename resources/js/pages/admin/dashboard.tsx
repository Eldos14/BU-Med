import { Head, Link } from '@inertiajs/react';
import { Calendar, ClipboardList, Stethoscope, Users } from 'lucide-react';

import { BarChart, DonutChart, HBarList } from '@/components/charts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Администрирование', href: '/admin/dashboard' }];

interface Stat {
    doctors: number;
    patients: number;
    appointments_today: number;
    appointments_total: number;
    planned: number;
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

interface RecentAppointment {
    id: number;
    patient_name: string;
    doctor_name: string;
    start_time: string;
    status: string;
}

interface RecentDoctor {
    id: number;
    fio: string;
    position: string;
    email: string;
}

interface Props {
    stats: Stat;
    status_breakdown: Slice[];
    appointments_7d: DayBar[];
    doctors_by_specialty: Slice[];
    osms_breakdown: Slice[];
    recent_appointments: RecentAppointment[];
    recent_doctors: RecentDoctor[];
}

const statusLabel: Record<string, string> = { planned: 'Запланировано', completed: 'Принято', cancelled: 'Отменено' };
const statusStyle: Record<string, string> = {
    planned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300',
};

export default function AdminDashboard({
    stats,
    status_breakdown,
    appointments_7d,
    doctors_by_specialty,
    osms_breakdown,
    recent_appointments,
    recent_doctors,
}: Props) {
    const cards = [
        { label: 'Врачей', value: stats.doctors, icon: Stethoscope, from: 'from-blue-500', to: 'to-indigo-600', href: '/admin/doctors' },
        { label: 'Пациентов', value: stats.patients, icon: Users, from: 'from-violet-500', to: 'to-purple-600', href: '/admin/patients' },
        { label: 'Записей сегодня', value: stats.appointments_today, icon: Calendar, from: 'from-emerald-500', to: 'to-teal-600', href: '/admin/appointments' },
        { label: 'Всего записей', value: stats.appointments_total, icon: ClipboardList, from: 'from-orange-500', to: 'to-rose-600', href: '/admin/appointments' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Панель администратора" />

            <div className="min-h-screen bg-slate-50 p-4 dark:bg-background lg:p-6">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">

                    {/* Header */}
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Панель администратора 👋</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Статистика клиники, врачей, пациентов и записей.</p>
                        </div>
                        <Link href="/admin/doctors/create" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                            + Добавить врача
                        </Link>
                    </div>

                    {/* Stat cards (gradient) */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {cards.map((c) => (
                            <Link key={c.label} href={c.href} className="group">
                                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.from} ${c.to} p-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg`}>
                                    <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                                    <c.icon className="h-6 w-6 text-white/90" />
                                    <p className="mt-4 text-3xl font-extrabold tabular-nums">{c.value}</p>
                                    <p className="text-xs text-white/80">{c.label}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Charts row 1 */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Bar chart */}
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-foreground">Записи за 7 дней</h2>
                                    <p className="text-xs text-muted-foreground">Динамика приёмов по дням</p>
                                </div>
                                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                    Всего: {stats.appointments_total}
                                </span>
                            </div>
                            <BarChart data={appointments_7d} color="#3b82f6" height={200} />
                        </div>

                        {/* Donut: status */}
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                            <h2 className="mb-4 font-bold text-foreground">Записи по статусу</h2>
                            <DonutChart data={status_breakdown} />
                        </div>
                    </div>

                    {/* Charts row 2 */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Specialties */}
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card lg:col-span-2">
                            <h2 className="mb-5 font-bold text-foreground">Врачи по специальностям</h2>
                            <HBarList data={doctors_by_specialty} />
                        </div>

                        {/* OSMS donut */}
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                            <h2 className="mb-4 font-bold text-foreground">ОСМС пациентов</h2>
                            <DonutChart data={osms_breakdown} size={150} />
                        </div>
                    </div>

                    {/* Tables row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Recent appointments */}
                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card lg:col-span-2">
                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <h2 className="font-bold text-foreground">Последние записи</h2>
                                <Link href="/admin/appointments" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                                    Все записи →
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[420px]">
                                    <thead>
                                        <tr className="border-b border-border bg-slate-50 dark:bg-muted/30">
                                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Пациент</th>
                                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Врач</th>
                                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Дата</th>
                                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_appointments.length === 0 ? (
                                            <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">Записей нет.</td></tr>
                                        ) : (
                                            recent_appointments.map((a) => (
                                                <tr key={a.id} className="border-t border-border hover:bg-slate-50/60 dark:hover:bg-muted/20">
                                                    <td className="px-5 py-3 text-sm text-foreground">{a.patient_name}</td>
                                                    <td className="px-5 py-3 text-sm text-muted-foreground">{a.doctor_name}</td>
                                                    <td className="whitespace-nowrap px-5 py-3 text-sm text-foreground">{a.start_time}</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[a.status]}`}>
                                                            {statusLabel[a.status] ?? a.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent doctors */}
                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <h2 className="font-bold text-foreground">Новые врачи</h2>
                                <Link href="/admin/doctors" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                                    Все →
                                </Link>
                            </div>
                            <div className="divide-y divide-border">
                                {recent_doctors.length === 0 ? (
                                    <p className="px-5 py-6 text-center text-sm text-muted-foreground">Нет врачей.</p>
                                ) : (
                                    recent_doctors.map((d) => (
                                        <Link key={d.id} href={route('admin.doctors.edit', d.id)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 dark:hover:bg-muted/20">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                                {d.fio[0]?.toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">{d.fio}</p>
                                                <p className="truncate text-xs text-muted-foreground">{d.position}</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
