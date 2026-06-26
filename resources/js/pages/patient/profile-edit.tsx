import { Head, useForm, usePage } from '@inertiajs/react';
import { Building2, Calendar, CheckCircle, AlertCircle, Eye, EyeOff, KeyRound, LoaderCircle, Mail, MapPin, Phone, Plus, User } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';



const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: '/patient/dashboard' },
    { title: 'Мой профиль', href: '/patient/profile/edit' },
];

interface Clinic {
    id: number;
    name: string;
    address: string;
}

interface Patient {
    id: number;
    fio: string;
    iin: string | null;
    birth_date: string | null;
    gender: string | null;
    address: string | null;
    contacts: string | null;
    clinic_id: number | null;
    photo: string | null;
    profile_complete: boolean;
}

interface Props {
    patient: Patient;
    clinics: Clinic[];
}

export default function PatientProfileEdit({ patient, clinics }: Props) {
    const { auth, flash } = usePage<SharedData>().props;
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Modal states
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [contactType, setContactType] = useState('');
    const [contactValue, setContactValue] = useState('');
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    // Main profile form
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        fio: patient.fio ?? '',
        iin: patient.iin ?? '',
        birth_date: patient.birth_date ? String(patient.birth_date).substring(0, 10) : '',
        gender: patient.gender ?? '',
        address: patient.address ?? '',
        contacts: patient.contacts ?? '',
        clinic_id: patient.clinic_id ? String(patient.clinic_id) : '',
        photo: null as File | null,
    });

    // Email change — step 1: request code
    const emailForm = useForm({ email: auth.user.email });
    // Email change — step 2: verify code
    const codeForm = useForm({ code: '' });
    const [emailStep, setEmailStep] = useState<'email' | 'code'>('email');

    // Password change form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('patient.profile.update'));
    };

    const submitEmail: FormEventHandler = (e) => {
        e.preventDefault();
        emailForm.post(route('patient.email.request-change'), {
            onSuccess: () => setEmailStep('code'),
        });
    };

    const submitCode: FormEventHandler = (e) => {
        e.preventDefault();
        codeForm.post(route('patient.email.confirm-change'), {
            onSuccess: () => {
                setEmailModalOpen(false);
                setEmailStep('email');
                codeForm.reset();
            },
        });
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            onSuccess: () => {
                setPasswordModalOpen(false);
                passwordForm.reset();
            },
        });
    };

    const handleAddContact = () => {
        if (!contactType || !contactValue) return;
        if (contactType === 'email') {
            emailForm.setData('email', contactValue);
        } else {
            setData('contacts', contactValue);
        }
        setContactModalOpen(false);
        setContactType('');
        setContactValue('');
    };

    const initials = (data.fio || auth.user.name)
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        patient.photo ? `/storage/${patient.photo}` : null
    );

    useEffect(() => {
        setPreviewUrl(patient.photo ? `/storage/${patient.photo}` : null);
    }, [patient.photo]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Мой профиль" />
            <div className="mx-auto max-w-5xl p-4 space-y-4">

                {flash?.success && (
                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">{flash.success}</p>
                    </div>
                )}

                {!patient.profile_complete && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Заполните все обязательные поля для полного доступа к функциям клиники.
                        </p>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-[260px_1fr]">

                    {/* ─── Left panel ─── */}
                    <div className="flex flex-col gap-3">

                        {/* Avatar + info card */}
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="h-28 w-28 rounded-full border-2 border-dashed border-muted-foreground/30 overflow-hidden flex items-center justify-center bg-muted">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Фото профиля" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-semibold text-muted-foreground">{initials}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-colors"
                                    title="Изменить фото"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/jpg,image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setData('photo', file);
                                            setPreviewUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>

                            <p className="font-semibold text-foreground">{data.fio || auth.user.name}</p>

                            {patient.profile_complete && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Подтверждён
                                </div>
                            )}

                            <div className="mt-4 w-full space-y-2 text-sm text-muted-foreground text-left">
                                {data.contacts && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        <span>{data.contacts}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 min-w-0">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate flex-1">{emailForm.data.email}</span>
                                    <button
                                        type="button"
                                        onClick={() => setEmailModalOpen(true)}
                                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                                        title="Изменить email"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add contact */}
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setContactModalOpen(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Добавить контакт
                            </button>
                        </div>

                        {/* Change password */}
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setPasswordModalOpen(true)}
                            >
                                <KeyRound className="mr-2 h-4 w-4" />
                                Сменить пароль
                            </Button>
                        </div>
                    </div>

                    {/* ─── Right card ─── */}
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                        <div className="border-b border-border px-6 py-4">
                            <h1 className="text-base font-semibold text-foreground">Профиль в BaishevMed</h1>
                        </div>

                        <form onSubmit={submit} encType="multipart/form-data">
                            <div className="divide-y divide-border">

                                {/* Email row */}
                                <div className="grid grid-cols-[150px_1fr] items-center gap-4 px-6 py-4">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5" />
                                        Email
                                    </span>
                                    <span className="text-sm text-foreground truncate max-w-sm">{emailForm.data.email}</span>
                                </div>

                                {/* FIO row */}
                                <div className="grid grid-cols-[150px_1fr] items-center gap-4 px-6 py-4">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        ФИО <span className="text-destructive">*</span>
                                    </span>
                                    <div className="max-w-sm">
                                        <Input
                                            value={data.fio}
                                            onChange={(e) => setData('fio', e.target.value)}
                                            placeholder="Фамилия Имя Отчество"
                                            required
                                        />
                                        <InputError message={errors.fio} className="mt-1" />
                                    </div>
                                </div>

                                {/* IIN row */}
                                <div className="grid grid-cols-[150px_1fr] items-center gap-4 px-6 py-4">
                                    <span className="text-sm text-muted-foreground">
                                        ИИН <span className="text-destructive">*</span>
                                    </span>
                                    <div className="max-w-sm">
                                        <Input
                                            value={data.iin}
                                            onChange={(e) => setData('iin', e.target.value)}
                                            placeholder="123456789012"
                                            maxLength={12}
                                        />
                                        <InputError message={errors.iin} className="mt-1" />
                                    </div>
                                </div>

                                {/* Birth date + gender */}
                                <div className="grid grid-cols-[150px_1fr] items-start gap-4 px-6 py-4">
                                    <span className="pt-2 text-sm text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Дата рождения <span className="text-destructive">*</span>
                                    </span>
                                    <div className="flex gap-3 max-w-sm">
                                        <div className="flex-1">
                                            <Input
                                                type="date"
                                                value={data.birth_date}
                                                onChange={(e) => setData('birth_date', e.target.value)}
                                            />
                                            <InputError message={errors.birth_date} className="mt-1" />
                                        </div>
                                        <div className="w-36">
                                            <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Пол" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Мужской</SelectItem>
                                                    <SelectItem value="female">Женский</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.gender} className="mt-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* Clinic */}
                                <div className="grid grid-cols-[150px_1fr] items-center gap-4 px-6 py-4">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Поликлиника <span className="text-destructive">*</span>
                                    </span>
                                    <div className="max-w-sm">
                                        <Select value={data.clinic_id} onValueChange={(v) => setData('clinic_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите поликлинику" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clinics.map((clinic) => (
                                                    <SelectItem key={clinic.id} value={String(clinic.id)}>
                                                        {clinic.name}
                                                        {clinic.address && (
                                                            <span className="ml-1 text-muted-foreground">— {clinic.address}</span>
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.clinic_id} className="mt-1" />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="grid grid-cols-[150px_1fr] items-center gap-4 px-6 py-4">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Адрес
                                    </span>
                                    <div className="max-w-sm">
                                        <Input
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="г. Актобе, ул. Ленина, 1"
                                        />
                                        <InputError message={errors.address} className="mt-1" />
                                    </div>
                                </div>
                                
                            </div>

                            <div className="border-t border-border px-6 py-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Сохранить профиль
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* ─── Add Contact Modal ─── */}
            <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Добавить контакт</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label>* Тип контакта</Label>
                            <Select value={contactType} onValueChange={setContactType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выбрать" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="phone">Мобильный телефон</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {contactType && (
                            <div className="grid gap-2">
                                <Label>{contactType === 'email' ? 'Email адрес' : 'Номер телефона'}</Label>
                                <Input
                                    value={contactValue}
                                    onChange={(e) => setContactValue(e.target.value)}
                                    placeholder={contactType === 'email' ? 'example@mail.com' : '+7 (700) 000-00-00'}
                                    type={contactType === 'email' ? 'email' : 'tel'}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => { setContactModalOpen(false); setContactType(''); setContactValue(''); }}>
                            Отменить
                        </Button>
                        <Button onClick={handleAddContact} disabled={!contactType || !contactValue}>
                            Сохранить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Change Email Modal (2 steps) ─── */}
            <Dialog open={emailModalOpen} onOpenChange={(open) => { setEmailModalOpen(open); if (!open) { setEmailStep('email'); codeForm.reset(); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {emailStep === 'email' ? 'Изменить email' : 'Введите код подтверждения'}
                        </DialogTitle>
                    </DialogHeader>

                    {emailStep === 'email' ? (
                        <form onSubmit={submitEmail}>
                            <div className="space-y-4 py-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="new-email">Новый email адрес</Label>
                                    <Input
                                        id="new-email"
                                        type="email"
                                        value={emailForm.data.email}
                                        onChange={(e) => emailForm.setData('email', e.target.value)}
                                        placeholder="example@mail.com"
                                        autoFocus
                                        required
                                    />
                                    <InputError message={emailForm.errors.email} />
                                </div>
                            </div>
                            <DialogFooter className="gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setEmailModalOpen(false)}>
                                    Отменить
                                </Button>
                                <Button type="submit" disabled={emailForm.processing}>
                                    {emailForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Отправить код
                                </Button>
                            </DialogFooter>
                        </form>
                    ) : (
                        <form onSubmit={submitCode}>
                            <div className="space-y-4 py-2">
                                <p className="text-sm text-muted-foreground">
                                    Код отправлен на <span className="font-medium text-foreground">{emailForm.data.email}</span>. Введите его ниже.
                                </p>
                                <div className="grid gap-2">
                                    <Label htmlFor="verify-code">6-значный код</Label>
                                    <Input
                                        id="verify-code"
                                        value={codeForm.data.code}
                                        onChange={(e) => codeForm.setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        maxLength={6}
                                        autoFocus
                                        required
                                        className="text-center text-lg tracking-widest font-mono"
                                    />
                                    <InputError message={codeForm.errors.code} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEmailStep('email')}
                                    className="text-xs text-muted-foreground hover:text-primary underline"
                                >
                                    Изменить email или отправить повторно
                                </button>
                            </div>
                            <DialogFooter className="gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setEmailModalOpen(false)}>
                                    Отменить
                                </Button>
                                <Button type="submit" disabled={codeForm.processing || codeForm.data.code.length !== 6}>
                                    {codeForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Подтвердить
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* ─── Change Password Modal ─── */}
            <Dialog open={passwordModalOpen} onOpenChange={(open) => { setPasswordModalOpen(open); if (!open) passwordForm.reset(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Сменить пароль</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitPassword}>
                        <div className="space-y-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">Текущий пароль</Label>
                                <div className="relative">
                                    <Input
                                        id="current_password"
                                        type={showCurrentPwd ? 'text' : 'password'}
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        autoFocus
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={passwordForm.errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="new_password">Новый пароль</Label>
                                <div className="relative">
                                    <Input
                                        id="new_password"
                                        type={showNewPwd ? 'text' : 'password'}
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPwd(!showNewPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={passwordForm.errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Подтвердите пароль</Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPwd ? 'text' : 'password'}
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={passwordForm.errors.password_confirmation} />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => { setPasswordModalOpen(false); passwordForm.reset(); }}>
                                Отменить
                            </Button>
                            <Button type="submit" disabled={passwordForm.processing}>
                                {passwordForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
