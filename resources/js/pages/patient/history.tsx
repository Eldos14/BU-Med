import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: '/patient/dashboard' },
    { title: 'История визитов', href: '/patient/history' },
];

interface Staff {
    id: number;
    fio: string;
    position: string;
}

interface Appointment {
    id: number;
    start_time: string;
    end_time: string;
    reason: string | null;
    status: 'planned' | 'completed' | 'cancelled';
    staff: Staff;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedAppointments {
    data: Appointment[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    appointments: PaginatedAppointments;
}

const statusLabel: Record<string, string> = {
    planned: 'Запланировано',
    completed: 'Принято',
    cancelled: 'Отменено',
};

const statusStyle: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
};

function fmt(dt: string): string {
    return new Date(dt).toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function History({ appointments }: Props) {
    const { flash, auth } = usePage<SharedData>().props;
    const [toast, setToast] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState<number | null>(null);

    useEffect(() => {
        if (flash.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash.success]);

    const handleCancel = (id: number) => {
        if (!confirm('Отменить запись?')) return;
        setCancelling(id);
        router.patch(route('patient.appointments.cancel', id), {}, {
            onFinish: () => setCancelling(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="История визитов" />

            {toast && (
                <div className="fixed right-4 top-4 z-50 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg">
                    {toast}
                </div>
            )}

            <div className="min-h-screen bg-slate-50 dark:bg-background pb-16">
                {/* Page title section */}
                <div className="bg-white dark:bg-card border-b border-border px-4 py-8 mb-6">
                    <div className="mx-auto max-w-5xl">
                        <h1 className="text-2xl font-bold text-foreground">Моя история визитов</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Вы видите все записи своей личной истории посещений.
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl px-4">
                    {/* Main card */}
                    <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                        {/* Card header */}
                        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border flex-wrap">
                            <div>
                                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300">
                                    Пациент: {auth.user.name}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Последние посещения и статус записи
                                </p>
                            </div>
                            <Link
                                href="/patient/dashboard"
                                className="rounded-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-medium transition-colors"
                            >
                                ← Вернуться на главную
                            </Link>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-muted/50">
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-blue-900 dark:text-blue-300">
                                            Дата начала
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-blue-900 dark:text-blue-300">
                                            Дата конца
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-blue-900 dark:text-blue-300">
                                            Врач
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-blue-900 dark:text-blue-300">
                                            Причина
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-blue-900 dark:text-blue-300">
                                            Статус
                                        </th>
                                        <th className="px-5 py-3.5"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                                                Записей не найдено.
                                            </td>
                                        </tr>
                                    ) : (
                                        appointments.data.map((appt) => (
                                            <tr
                                                key={appt.id}
                                                className="border-t border-border hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-5 py-4 text-sm text-foreground whitespace-nowrap">
                                                    {fmt(appt.start_time)}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-foreground whitespace-nowrap">
                                                    {fmt(appt.end_time)}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-foreground">{appt.staff.fio}</p>
                                                    <p className="text-xs text-muted-foreground">{appt.staff.position}</p>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-foreground max-w-[180px] truncate">
                                                    {appt.reason ?? '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[appt.status]}`}>
                                                        {statusLabel[appt.status]}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {appt.status === 'planned' && (
                                                        <button
                                                            onClick={() => handleCancel(appt.id)}
                                                            disabled={cancelling === appt.id}
                                                            className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                                                        >
                                                            {cancelling === appt.id ? '...' : 'Отменить'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {appointments.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1 border-t border-border px-6 py-4">
                                {appointments.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveScroll
                                        className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm transition-colors ${
                                            link.active
                                                ? 'bg-blue-600 font-semibold text-white'
                                                : link.url
                                                  ? 'border border-border hover:bg-slate-50'
                                                  : 'cursor-default text-muted-foreground/40'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Book button */}
                    <div className="mt-5 text-center">
                        <Link
                            href="/patient/doctors"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-semibold transition-colors shadow-sm"
                        >
                            + Новая запись к врачу
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
