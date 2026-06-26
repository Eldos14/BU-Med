import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface AppointmentRow {
    id: number;
    start_time: string;
    end_time: string;
    reason: string | null;
    status: 'planned' | 'completed' | 'cancelled';
}

interface Props {
    patient_name: string;
    doctor_name: string;
    appointments: AppointmentRow[];
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

export default function PatientHistory({ patient_name, doctor_name, appointments }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Панель врача', href: '/doctor/dashboard' },
        { title: 'Пациенты', href: '/doctor/patients' },
        { title: patient_name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`История — ${patient_name}`} />

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                {/* Header */}
                <div className="border-b border-border bg-white px-6 py-6 dark:bg-card">
                    <div className="mx-auto flex max-w-5xl items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{patient_name}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                История визитов · {appointments.length} записей
                            </p>
                        </div>
                        <Link href="/doctor/patients" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            ← Назад
                        </Link>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl p-6">
                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[680px]">
                                <thead>
                                    <tr className="border-b border-border bg-slate-50 dark:bg-muted/30">
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Дата начала</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Дата конца</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Врач</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Причина</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                                                Записей не найдено.
                                            </td>
                                        </tr>
                                    ) : (
                                        appointments.map((a) => (
                                            <tr key={a.id} className="border-t border-border transition-colors hover:bg-slate-50/60 dark:hover:bg-muted/20">
                                                <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{a.start_time}</td>
                                                <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">{a.end_time}</td>
                                                <td className="px-6 py-4 text-sm text-foreground">{doctor_name}</td>
                                                <td className="px-6 py-4 text-sm text-foreground">{a.reason ?? '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[a.status]}`}>
                                                        {statusLabel[a.status]}
                                                    </span>
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
