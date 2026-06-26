import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Search, Stethoscope, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface PatientData {
    id: number;
    fio: string;
    email: string;
    contacts: string;
    birth_date: string;
    gender: string | null;
    address: string;
    iin: string;
    osms_status: boolean;
    osms_end_date: string;
    created_at: string;
    clinic_name: string | null;
    district_doctor_id: number | null;
    district_doctor_fio: string | null;
}

interface AppointmentRow {
    id: number;
    doctor_name: string;
    start_time: string;
    reason: string | null;
    status: string;
}

interface Doctor {
    id: number;
    fio: string;
    position: string;
}

interface Props {
    patient: PatientData;
    appointments: AppointmentRow[];
    doctors: Doctor[];
}

const statusLabel: Record<string, string> = { planned: 'Запланировано', completed: 'Принято', cancelled: 'Отменено' };
const statusStyle: Record<string, string> = {
    planned: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

function AssignDoctorWidget({ patient, doctors }: { patient: PatientData; doctors: Doctor[] }) {
    const { flash } = usePage<SharedData & { flash: { success?: string } }>().props;
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);

    const form = useForm({ district_doctor_id: patient.district_doctor_id ?? ('' as number | '') });

    const filtered = doctors.filter(
        (d) =>
            search.length === 0 ||
            d.fio.toLowerCase().includes(search.toLowerCase()) ||
            d.position.toLowerCase().includes(search.toLowerCase()),
    );

    const select = (id: number) => {
        form.setData('district_doctor_id', id);
        setSearch('');
        setOpen(false);
        form.patch(route('admin.patients.assign-doctor', patient.id), {
            preserveScroll: true,
        });
    };

    const clear = () => {
        form.setData('district_doctor_id', '');
        form.patch(route('admin.patients.assign-doctor', patient.id), {
            data: { district_doctor_id: null },
            preserveScroll: true,
        });
    };

    return (
        <div className="rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                    <h2 className="font-bold text-foreground">Участковый врач</h2>
                </div>
                {patient.district_doctor_fio && (
                    <button onClick={clear} disabled={form.processing}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <UserX className="h-3.5 w-3.5" /> Снять
                    </button>
                )}
            </div>

            <div className="p-5">
                {flash?.success && (
                    <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {patient.district_doctor_fio ? (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            {patient.district_doctor_fio.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{patient.district_doctor_fio}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Назначен участковым врачом</p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 rounded-xl border border-dashed border-border px-4 py-3 text-center text-sm text-muted-foreground">
                        Участковый врач не назначен
                    </div>
                )}

                {/* Search + dropdown */}
                <div className="relative">
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Найти и назначить врача..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                            onFocus={() => setOpen(true)}
                            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                    </div>

                    {open && search.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                            {filtered.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-muted-foreground">Врачи не найдены</p>
                            ) : (
                                <ul className="max-h-56 overflow-y-auto">
                                    {filtered.slice(0, 10).map((d) => (
                                        <li key={d.id}>
                                            <button
                                                type="button"
                                                onClick={() => select(d.id)}
                                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted ${
                                                    patient.district_doctor_id === d.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                                                }`}
                                            >
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                    {d.fio.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-foreground">{d.fio}</p>
                                                    <p className="truncate text-xs text-muted-foreground">{d.position}</p>
                                                </div>
                                                {patient.district_doctor_id === d.id && (
                                                    <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-blue-500" />
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
            </div>
        </div>
    );
}

export default function AdminPatientShow({ patient, appointments, doctors }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Администрирование', href: '/admin/dashboard' },
        { title: 'Пациенты', href: '/admin/patients' },
        { title: patient.fio, href: '#' },
    ];

    const genderLabel = patient.gender === 'male' ? 'Мужской' : patient.gender === 'female' ? 'Женский' : '—';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={patient.fio} />

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                <div className="border-b border-border bg-white px-6 py-5 dark:bg-card">
                    <div className="mx-auto flex max-w-5xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{patient.fio}</h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">{patient.email}</p>
                        </div>
                        <Link href="/admin/patients" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            ← Назад
                        </Link>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl flex flex-col gap-5 p-6 lg:flex-row lg:items-start">

                    {/* LEFT: info + appointments */}
                    <div className="flex flex-1 flex-col gap-5">

                        {/* Info card */}
                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                            <div className="border-b border-border bg-slate-50 px-5 py-3 dark:bg-muted/30">
                                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Данные пациента</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-5 sm:grid-cols-3">
                                {[
                                    { label: 'ФИО', value: patient.fio },
                                    { label: 'Email', value: patient.email },
                                    { label: 'Контакты', value: patient.contacts },
                                    { label: 'Дата рождения', value: patient.birth_date },
                                    { label: 'Пол', value: genderLabel },
                                    { label: 'ИИН', value: patient.iin },
                                    { label: 'Адрес', value: patient.address },
                                    { label: 'Поликлиника', value: patient.clinic_name ?? '—' },
                                    { label: 'ОСМС до', value: patient.osms_end_date },
                                    { label: 'Зарегистрирован', value: patient.created_at },
                                ].map((f) => (
                                    <div key={f.label}>
                                        <p className="text-xs text-muted-foreground">{f.label}</p>
                                        <p className="mt-0.5 text-sm font-medium text-foreground">{f.value}</p>
                                    </div>
                                ))}
                                <div>
                                    <p className="text-xs text-muted-foreground">ОСМС статус</p>
                                    <div className="mt-1 flex items-center gap-1">
                                        {patient.osms_status
                                            ? <><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm text-green-600">Активен</span></>
                                            : <><XCircle className="h-4 w-4 text-red-400" /><span className="text-sm text-red-500">Неактивен</span></>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Appointments */}
                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                            <div className="border-b border-border px-5 py-4">
                                <h2 className="font-bold text-foreground">История записей</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px]">
                                    <thead>
                                        <tr className="border-b border-border bg-slate-50 dark:bg-muted/30">
                                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Врач</th>
                                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Дата</th>
                                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Причина</th>
                                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.length === 0 ? (
                                            <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">Записей нет.</td></tr>
                                        ) : (
                                            appointments.map((a) => (
                                                <tr key={a.id} className="border-t border-border hover:bg-slate-50/60 dark:hover:bg-muted/20">
                                                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{a.doctor_name}</td>
                                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap text-foreground">{a.start_time}</td>
                                                    <td className="px-5 py-3.5 text-sm text-foreground">{a.reason ?? '—'}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[a.status]}`}>
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

                    {/* RIGHT: assign doctor */}
                    <div className="w-full lg:w-80 lg:shrink-0">
                        <AssignDoctorWidget patient={patient} doctors={doctors} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
