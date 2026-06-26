import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Администрирование', href: '/admin/dashboard' },
    { title: 'Пациенты', href: '/admin/patients' },
];

interface PatientRow {
    id: number;
    fio: string;
    email: string;
    contacts: string;
    birth_date: string;
    osms_status: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPatients {
    data: PatientRow[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    patients: PaginatedPatients;
}

export default function AdminPatients({ patients }: Props) {
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (id: number, fio: string) => {
        if (!confirm(`Удалить пациента «${fio}»? Это также удалит его аккаунт.`)) return;
        setDeleting(id);
        router.delete(route('admin.patients.destroy', id), {
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Пациенты" />

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                <div className="border-b border-border bg-white px-6 py-5 dark:bg-card">
                    <div className="mx-auto max-w-6xl">
                        <h1 className="text-2xl font-bold text-foreground">Пациенты</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Всего: {patients.total}</p>
                    </div>
                </div>

                <div className="mx-auto max-w-6xl p-6">
                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-border bg-slate-50 dark:bg-muted/30">
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">ФИО</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Email</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Контакты</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Дата рождения</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">ОСМС</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Зарегистрирован</th>
                                        <th className="px-5 py-3.5" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                                                Пациентов нет.
                                            </td>
                                        </tr>
                                    ) : (
                                        patients.data.map((p) => (
                                            <tr key={p.id} className="border-t border-border hover:bg-slate-50/60 dark:hover:bg-muted/20">
                                                <td className="px-5 py-3.5 text-sm font-medium text-foreground">{p.fio}</td>
                                                <td className="px-5 py-3.5 text-sm text-muted-foreground">{p.email}</td>
                                                <td className="px-5 py-3.5 text-sm text-muted-foreground">{p.contacts}</td>
                                                <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{p.birth_date}</td>
                                                <td className="px-5 py-3.5">
                                                    {p.osms_status
                                                        ? <CheckCircle className="h-4 w-4 text-green-500" />
                                                        : <XCircle className="h-4 w-4 text-red-400" />
                                                    }
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{p.created_at}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('admin.patients.show', p.id)}
                                                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-slate-50 dark:text-blue-400"
                                                        >
                                                            Открыть
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(p.id, p.fio)}
                                                            disabled={deleting === p.id}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {patients.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1 border-t border-border px-5 py-4">
                                {patients.links.map((link, i) => (
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
