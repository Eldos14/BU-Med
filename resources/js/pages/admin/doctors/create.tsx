import { Head, Link, useForm } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Администрирование', href: '/admin/dashboard' },
    { title: 'Врачи', href: '/admin/doctors' },
    { title: 'Добавить врача', href: '/admin/doctors/create' },
];

interface DoctorForm {
    [key: string]: string;
    name: string;
    email: string;
    password: string;
    fio: string;
    position: string;
    contacts: string;
    specialization: string;
}

export default function AdminDoctorCreate() {
    const { data, setData, post, processing, errors } = useForm<DoctorForm>({
        name: '',
        email: '',
        password: '',
        fio: '',
        position: '',
        contacts: '',
        specialization: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.doctors.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Добавить врача" />

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                <div className="border-b border-border bg-white px-6 py-5 dark:bg-card">
                    <div className="mx-auto flex max-w-2xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Добавить врача</h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">Создаётся аккаунт и профиль врача одновременно.</p>
                        </div>
                        <Link href="/admin/doctors" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            ← Назад
                        </Link>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* Account section */}
                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                            <div className="border-b border-border bg-slate-50 px-5 py-3 dark:bg-muted/30">
                                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Аккаунт (для входа)</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Имя пользователя *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="doctor_ivanov"
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Email *</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="doctor@clinic.kz"
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Пароль * (мин. 8 символов)</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Profile section */}
                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
                            <div className="border-b border-border bg-slate-50 px-5 py-3 dark:bg-muted/30">
                                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Профиль врача</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">ФИО *</label>
                                    <input
                                        type="text"
                                        value={data.fio}
                                        onChange={(e) => setData('fio', e.target.value)}
                                        placeholder="Иванов Иван Иванович"
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.fio && <p className="mt-1 text-xs text-red-600">{errors.fio}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Должность *</label>
                                    <input
                                        type="text"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="Терапевт"
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Специализация</label>
                                    <input
                                        type="text"
                                        value={data.specialization}
                                        onChange={(e) => setData('specialization', e.target.value)}
                                        placeholder="Кардиология"
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.specialization && <p className="mt-1 text-xs text-red-600">{errors.specialization}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Контакты</label>
                                    <input
                                        type="text"
                                        value={data.contacts}
                                        onChange={(e) => setData('contacts', e.target.value)}
                                        placeholder="+7 700 000 00 00"
                                        className="w-full rounded-xl border border-input bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40"
                                    />
                                    {errors.contacts && <p className="mt-1 text-xs text-red-600">{errors.contacts}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link href="/admin/doctors" className="rounded-xl border border-border px-5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                Отмена
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Создаю...' : 'Создать врача'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
