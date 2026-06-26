import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Администрирование', href: '/admin/dashboard' },
    { title: 'Врачи', href: '/admin/doctors' },
];

interface Doctor {
    id: number;
    fio: string;
    position: string;
    contacts: string | null;
    email: string;
    specializations: string;
}

interface Props {
    doctors: Doctor[];
}

function getInitial(name: string): string {
    return name.trim()[0]?.toUpperCase() ?? '?';
}

export default function AdminDoctors({ doctors }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [toast, setToast] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        const msg = flash.success ?? flash.error ?? null;
        if (msg) {
            setToast(msg);
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash.success, flash.error]);

    const handleDelete = (id: number, fio: string) => {
        if (!confirm(`Удалить врача «${fio}»? Это также удалит его аккаунт.`)) { return; }
        setDeleting(id);
        router.delete(route('admin.doctors.destroy', id), {
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Врачи" />

            {toast && (
                <div className="fixed right-4 top-4 z-50 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg">
                    {toast}
                </div>
            )}

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                <div className="border-b border-border bg-white px-6 py-5 dark:bg-card">
                    <div className="mx-auto flex max-w-6xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Врачи</h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">{doctors.length} записей</p>
                        </div>
                        <Link
                            href="/admin/doctors/create"
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Добавить врача
                        </Link>
                    </div>
                </div>

                <div className="mx-auto max-w-6xl p-6">
                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-border bg-slate-50 dark:bg-muted/30">
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">ФИО</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Должность</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Специализация</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Email</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Контакты</th>
                                        <th className="px-5 py-3.5" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                                                Врачи не добавлены.{' '}
                                                <Link href="/admin/doctors/create" className="text-blue-600 hover:underline">
                                                    Добавить первого врача
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        doctors.map((d) => (
                                            <tr key={d.id} className="border-t border-border hover:bg-slate-50/60 dark:hover:bg-muted/20">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                                            {getInitial(d.fio)}
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground">{d.fio}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-foreground">{d.position}</td>
                                                <td className="px-5 py-3.5 text-sm text-muted-foreground">{d.specializations || '—'}</td>
                                                <td className="px-5 py-3.5 text-sm text-muted-foreground">{d.email}</td>
                                                <td className="px-5 py-3.5 text-sm text-muted-foreground">{d.contacts || '—'}</td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('admin.doctors.edit', d.id)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(d.id, d.fio)}
                                                            disabled={deleting === d.id}
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
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
