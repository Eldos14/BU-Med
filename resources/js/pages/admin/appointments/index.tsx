import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Администрирование', href: '/admin/dashboard' },
    { title: 'Записи', href: '/admin/appointments' },
];

interface AppointmentRow {
    id: number;
    patient_name: string;
    doctor_name: string;
    start_time: string;
    reason: string | null;
    status: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedAppointments {
    data: AppointmentRow[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    appointments: PaginatedAppointments;
    filter_status: string;
}

const statusLabel: Record<string, string> = { planned: 'Запланировано', completed: 'Принято', cancelled: 'Отменено' };
const statusStyle: Record<string, string> = {
    planned: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

const filters = [
    { value: '', label: 'Все' },
    { value: 'planned', label: 'Запланировано' },
    { value: 'completed', label: 'Принято' },
    { value: 'cancelled', label: 'Отменено' },
];

export default function AdminAppointments({ appointments, filter_status }: Props) {
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

    const changeStatus = (id: number, status: string) => {
        setProcessing(id);
        router.patch(route('admin.appointments.update', id), { status }, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const applyFilter = (status: string) => {
        router.get(route('admin.appointments.index'), status ? { status } : {}, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Все записи" />

            {toast && (
                <div className="fixed right-4 top-4 z-50 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg">
                    {toast}
                </div>
            )}

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                <div className="border-b border-border bg-white px-6 py-5 dark:bg-card">
                    <div className="mx-auto max-w-6xl">
                        <h1 className="text-2xl font-bold text-foreground">Все записи</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Всего: {appointments.total}</p>
                    </div>
                </div>

                <div className="mx-auto max-w-6xl p-6">
                    {/* Filter tabs */}
                    <div className="mb-4 flex gap-2 flex-wrap">
                        {filters.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => applyFilter(f.value)}
                                className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-colors ${
                                    filter_status === f.value
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-border bg-white text-foreground hover:bg-slate-50 dark:bg-card dark:hover:bg-muted/30'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-border bg-slate-50 dark:bg-muted/30">
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Пациент</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Врач</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Дата</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Причина</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Статус</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Действие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.data.length === 0 ? (
                                        <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">Записей нет.</td></tr>
                                    ) : (
                                        appointments.data.map((a) => (
                                            <tr key={a.id} className="border-t border-border hover:bg-slate-50/60 dark:hover:bg-muted/20">
                                                <td className="px-5 py-3.5 text-sm font-medium text-foreground">{a.patient_name}</td>
                                                <td className="px-5 py-3.5 text-sm text-muted-foreground">{a.doctor_name}</td>
                                                <td className="px-5 py-3.5 text-sm whitespace-nowrap text-foreground">{a.start_time}</td>
                                                <td className="px-5 py-3.5 text-sm text-foreground max-w-[160px] truncate">{a.reason ?? '—'}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[a.status]}`}>
                                                        {statusLabel[a.status]}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <select
                                                        value={a.status}
                                                        disabled={processing === a.id}
                                                        onChange={(e) => changeStatus(a.id, e.target.value)}
                                                        className="rounded-lg border border-input bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:bg-card"
                                                    >
                                                        <option value="planned">Запланировано</option>
                                                        <option value="completed">Принято</option>
                                                        <option value="cancelled">Отменено</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {appointments.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1 border-t border-border px-5 py-4">
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
                </div>
            </div>
        </AppLayout>
    );
}
