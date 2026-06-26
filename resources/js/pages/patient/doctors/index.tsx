import { Head, Link, router } from '@inertiajs/react';
import { UserRound } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: '/patient/dashboard' },
    { title: 'Список врачей', href: '/patient/doctors' },
];

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
    work_places?: WorkPlace[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedDoctors {
    data: Doctor[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    doctors: PaginatedDoctors;
    search: string;
}

function getInitials(fio: string): string {
    return fio
        .trim()
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0] ?? '')
        .join('')
        .toUpperCase();
}

export default function DoctorIndex({ doctors, search: initialSearch }: Props) {
    const [search, setSearch] = useState(initialSearch);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('patient.doctors.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Список врачей" />

            <div className="min-h-screen bg-slate-50 dark:bg-background pb-16">
                {/* Page header */}
                <div className="bg-white dark:bg-card border-b border-border px-4 py-6 mb-6">
                    <div className="mx-auto max-w-5xl flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Список врачей</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Профили, специализации и отзывы. Запись — через участкового врача.</p>
                        </div>
                        <Link
                            href="/patient/dashboard"
                            className="rounded-lg bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 text-sm font-medium transition-colors"
                        >
                            ← Вернуться на главную
                        </Link>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl px-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Поиск по имени или должности"
                            className="flex-1 rounded-xl border border-input bg-white dark:bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-semibold transition-colors shadow-sm"
                        >
                            Найти
                        </button>
                    </form>

                    {/* Results */}
                    {doctors.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-white dark:bg-card py-16 text-center shadow-sm">
                            <UserRound className="h-14 w-14 text-muted-foreground/40" />
                            <p className="text-muted-foreground">
                                {initialSearch ? 'Врачи не найдены. Попробуйте другой запрос.' : 'Врачи ещё не добавлены.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {doctors.data.map((doctor) => (
                                    <Link
                                        key={doctor.id}
                                        href={route('doctors.show', doctor.id)}
                                        className="group"
                                    >
                                        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-border transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md h-full flex flex-col">
                                            {/* Avatar */}
                                            <div
                                                className="relative h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 ring-2 ring-slate-100 dark:ring-slate-700"
                                                style={{ background: 'linear-gradient(135deg, #2a7de1, #17a2b8)' }}
                                            >
                                                {getInitials(doctor.fio)}
                                                {doctor.photo && (
                                                    <img
                                                        src={`/storage/${doctor.photo}`}
                                                        alt={doctor.fio}
                                                        className="absolute inset-0 h-full w-full rounded-full object-cover"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                )}
                                            </div>

                                            <p className="text-lg font-semibold text-foreground leading-snug mb-1">
                                                {doctor.fio}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-3">{doctor.position}</p>

                                            {doctor.specializations.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {doctor.specializations.map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="rounded-md bg-blue-50 dark:bg-blue-950 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                                                        >
                                                            {s.specialty}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-auto pt-3 border-t border-border">
                                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                                                    Открыть профиль →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {doctors.last_page > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-1">
                                    {doctors.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url ?? '#'}
                                            preserveScroll
                                            className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-sm transition-colors ${
                                                link.active
                                                    ? 'bg-blue-600 font-semibold text-white'
                                                    : link.url
                                                      ? 'border border-border bg-white dark:bg-card hover:bg-slate-50'
                                                      : 'cursor-default text-muted-foreground/40'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
