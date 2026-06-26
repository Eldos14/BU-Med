import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Award, BookOpen, Camera, GraduationCap, Lock, Plus, Trash2, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Панель врача', href: '/doctor/dashboard' },
    { title: 'Профиль', href: '/doctor/profile' },
];

interface Achievement {
    title: string;
    year: string;
    org: string;
    type: 'course' | 'certificate' | 'achievement';
}

interface StaffData {
    id: number;
    fio: string;
    position: string;
    contacts: string | null;
    bio: string | null;
    achievements: Achievement[];
    photo: string | null;
    specialization: string;
    work_place: string;
}

interface Props {
    staff: StaffData;
    user: { name: string; email: string };
}

type Tab = 'personal' | 'password' | 'achievements';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    course: { label: 'Курс', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    certificate: { label: 'Сертификат', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
    achievement: { label: 'Достижение', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
};

function AvatarBlock({ staff, onPhotoChange, preview }: {
    staff: StaffData;
    onPhotoChange: (file: File) => void;
    preview: string | null;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const src = preview ?? staff.photo;

    return (
        <div className="flex items-center gap-5">
            <div className="relative">
                {src ? (
                    <img src={src} alt={staff.fio} className="h-20 w-20 rounded-full object-cover ring-4 ring-white dark:ring-card shadow" />
                ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow ring-4 ring-white dark:ring-card"
                        style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)' }}>
                        {(staff.fio || 'D')[0].toUpperCase()}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow transition-colors hover:bg-blue-700 dark:border-card"
                >
                    <Camera className="h-3.5 w-3.5" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhotoChange(f); }} />
            </div>
            <div>
                <p className="text-lg font-bold text-foreground">{staff.fio || staff.fio}</p>
                <p className="text-sm text-muted-foreground">{staff.position}</p>
                {staff.specialization && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{staff.specialization}</p>
                )}
            </div>
        </div>
    );
}

export default function DoctorProfile({ staff, user }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [tab, setTab] = useState<Tab>('personal');
    const [toast, setToast] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    useEffect(() => {
        if (flash.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash.success]);

    /* ── Tab 1: Personal ── */
    const personalForm = useForm({
        tab: 'personal',
        fio: staff.fio ?? '',
        position: staff.position ?? '',
        contacts: staff.contacts ?? '',
    });

    const handlePersonalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (photoFile) {
            router.post(route('doctor.profile.update'), {
                _method: 'PATCH',
                tab: 'personal',
                fio: personalForm.data.fio,
                position: personalForm.data.position,
                contacts: personalForm.data.contacts,
                photo: photoFile,
            }, { forceFormData: true, preserveScroll: true, onSuccess: () => { setPhotoFile(null); setPhotoPreview(null); } });
        } else {
            personalForm.patch(route('doctor.profile.update'), { preserveScroll: true });
        }
    };

    /* ── Tab 2: Password ── */
    const passwordForm = useForm({ tab: 'password', current_password: '', password: '', password_confirmation: '' });
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.patch(route('doctor.profile.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    /* ── Tab 3: Achievements ── */
    const [bio, setBio] = useState(staff.bio ?? '');
    const [achievements, setAchievements] = useState<Achievement[]>(staff.achievements ?? []);
    const [addingNew, setAddingNew] = useState(false);
    const [newItem, setNewItem] = useState<Achievement>({ title: '', year: '', org: '', type: 'course' });

    const addAchievement = () => {
        if (!newItem.title.trim()) return;
        setAchievements((prev) => [...prev, { ...newItem }]);
        setNewItem({ title: '', year: '', org: '', type: 'course' });
        setAddingNew(false);
    };

    const removeAchievement = (i: number) => {
        setAchievements((prev) => prev.filter((_, idx) => idx !== i));
    };

    const handleAchievementsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.patch(route('doctor.profile.update'), {
            tab: 'achievements',
            bio,
            achievements,
        } as Record<string, unknown>, { preserveScroll: true });
    };

    const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'personal', label: 'Личные данные', icon: <User className="h-4 w-4" /> },
        { key: 'password', label: 'Безопасность', icon: <Lock className="h-4 w-4" /> },
        { key: 'achievements', label: 'Достижения', icon: <GraduationCap className="h-4 w-4" /> },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Мой профиль" />

            {toast && (
                <div className="fixed right-4 top-4 z-50 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 shadow-lg dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                    {toast}
                </div>
            )}

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                <div className="border-b border-border bg-white px-6 py-5 dark:bg-card">
                    <div className="mx-auto max-w-3xl">
                        <h1 className="text-xl font-bold text-foreground">Мой профиль</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Управление личными данными и настройками</p>
                    </div>
                </div>

                <div className="mx-auto max-w-3xl p-5">
                    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            {TABS.map(({ key, label, icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setTab(key)}
                                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                                        tab === key
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {icon}
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">

                            {/* ── TAB 1: Personal ── */}
                            {tab === 'personal' && (
                                <form onSubmit={handlePersonalSubmit} className="flex flex-col gap-6">
                                    <AvatarBlock
                                        staff={staff}
                                        preview={photoPreview}
                                        onPhotoChange={(f) => { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }}
                                    />

                                    <hr className="border-border" />

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">ФИО</label>
                                            <input type="text" value={personalForm.data.fio}
                                                onChange={(e) => personalForm.setData('fio', e.target.value)}
                                                className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40" />
                                            {personalForm.errors.fio && <p className="mt-1 text-xs text-red-600">{personalForm.errors.fio}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
                                            <input type="text" value={user.email} disabled
                                                className="w-full rounded-xl border border-input bg-slate-100 px-4 py-3 text-sm text-muted-foreground dark:bg-muted/20" />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Должность</label>
                                            <input type="text" value={personalForm.data.position}
                                                onChange={(e) => personalForm.setData('position', e.target.value)}
                                                className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40" />
                                            {personalForm.errors.position && <p className="mt-1 text-xs text-red-600">{personalForm.errors.position}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Специализация</label>
                                            <input type="text" value={staff.specialization || '—'} disabled
                                                className="w-full rounded-xl border border-input bg-slate-100 px-4 py-3 text-sm text-muted-foreground dark:bg-muted/20" />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Контакты</label>
                                            <input type="text" value={personalForm.data.contacts}
                                                onChange={(e) => personalForm.setData('contacts', e.target.value)}
                                                placeholder="+7..."
                                                className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40" />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Кабинет / отделение</label>
                                            <input type="text" value={staff.work_place || '—'} disabled
                                                className="w-full rounded-xl border border-input bg-slate-100 px-4 py-3 text-sm text-muted-foreground dark:bg-muted/20" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button type="submit" disabled={personalForm.processing}
                                            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                                            {personalForm.processing ? 'Сохраняю...' : 'Сохранить изменения'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── TAB 2: Password ── */}
                            {tab === 'password' && (
                                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
                                    <div className="rounded-xl border border-border bg-slate-50 px-4 py-3 dark:bg-muted/20">
                                        <p className="text-sm text-muted-foreground">
                                            Для смены пароля введите текущий пароль и новый пароль дважды.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Текущий пароль</label>
                                        <input type="password" value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40" />
                                        {passwordForm.errors.current_password && (
                                            <p className="mt-1 text-xs text-red-600">{passwordForm.errors.current_password}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Новый пароль</label>
                                            <input type="password" value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40" />
                                            {passwordForm.errors.password && (
                                                <p className="mt-1 text-xs text-red-600">{passwordForm.errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Подтвердите пароль</label>
                                            <input type="password" value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button type="submit" disabled={passwordForm.processing}
                                            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                                            {passwordForm.processing ? 'Сохраняю...' : 'Изменить пароль'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── TAB 3: Achievements ── */}
                            {tab === 'achievements' && (
                                <form onSubmit={handleAchievementsSubmit} className="flex flex-col gap-5">
                                    {/* Bio */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            <BookOpen className="mr-1 inline h-3.5 w-3.5" />
                                            О себе
                                        </label>
                                        <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                                            rows={3} maxLength={800}
                                            placeholder="Краткая информация о себе, опыте работы..."
                                            className="w-full rounded-xl border border-input bg-slate-50 px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/40" />
                                        <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/800</p>
                                    </div>

                                    {/* Achievement list */}
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                <Award className="mr-1 inline h-3.5 w-3.5" />
                                                Курсы, сертификаты и достижения
                                            </label>
                                            <button type="button" onClick={() => setAddingNew(true)}
                                                className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300">
                                                <Plus className="h-3.5 w-3.5" />
                                                Добавить
                                            </button>
                                        </div>

                                        {/* Add new inline form */}
                                        {addingNew && (
                                            <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                                                <div className="mb-3 grid grid-cols-3 gap-3">
                                                    <div className="col-span-3 sm:col-span-2">
                                                        <input type="text" placeholder="Название курса/сертификата*"
                                                            value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                                            className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card" />
                                                    </div>
                                                    <div>
                                                        <input type="text" placeholder="Год"
                                                            value={newItem.year} onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
                                                            className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card" />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <input type="text" placeholder="Организация / учреждение"
                                                            value={newItem.org} onChange={(e) => setNewItem({ ...newItem, org: e.target.value })}
                                                            className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card" />
                                                    </div>
                                                    <div>
                                                        <select value={newItem.type}
                                                            onChange={(e) => setNewItem({ ...newItem, type: e.target.value as Achievement['type'] })}
                                                            className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card">
                                                            <option value="course">Курс</option>
                                                            <option value="certificate">Сертификат</option>
                                                            <option value="achievement">Достижение</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={addAchievement}
                                                        className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                                                        Добавить
                                                    </button>
                                                    <button type="button" onClick={() => setAddingNew(false)}
                                                        className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted">
                                                        Отмена
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {achievements.length === 0 && !addingNew ? (
                                            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
                                                <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
                                                <p className="text-sm text-muted-foreground">Нет добавленных курсов или сертификатов</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {achievements.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3 dark:bg-muted/20">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_LABELS[item.type]?.color ?? ''}`}>
                                                                    {TYPE_LABELS[item.type]?.label}
                                                                </span>
                                                                <p className="text-sm font-medium text-foreground">{item.title}</p>
                                                            </div>
                                                            {(item.org || item.year) && (
                                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                                    {[item.org, item.year].filter(Boolean).join(' · ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button type="button" onClick={() => removeAchievement(i)}
                                                            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <button type="submit"
                                            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                                            Сохранить
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
