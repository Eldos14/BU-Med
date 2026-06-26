import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Shield, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: '/patient/dashboard' },
    { title: 'Пакет ОСМС', href: '/patient/osms' },
];

interface Props {
    osms_status: boolean;
    osms_end_date: string | null;
    osms_type: string | null;
    patient_fio: string;
}

const coveredServices = [
    'Консультации врачей-специалистов',
    'Первичная медико-санитарная помощь',
    'Скорая медицинская помощь',
    'Стационарная помощь по направлению',
    'Диагностика и лабораторные исследования',
    'Амбулаторно-поликлинические услуги',
];

export default function OsmsPage({ osms_status, osms_end_date, osms_type, patient_fio }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Пакет ОСМС" />

            <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
                        <Shield className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Пакет ОСМС</h1>
                        <p className="text-sm text-muted-foreground">Обязательное социальное медицинское страхование</p>
                    </div>
                </div>

                {/* Status card */}
                <div
                    className="rounded-xl p-5 text-white"
                    style={{
                        background: osms_status
                            ? 'linear-gradient(135deg, #16a34a, #15803d)'
                            : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        {osms_status ? (
                            <CheckCircle2 className="h-8 w-8 text-green-200" />
                        ) : (
                            <XCircle className="h-8 w-8 text-red-200" />
                        )}
                        <div>
                            <p className="text-lg font-bold">
                                {osms_status ? 'ОСМС активен' : 'ОСМС не активен'}
                            </p>
                            <p className="text-sm opacity-80">
                                {osms_status ? 'Вы охвачены страхованием' : 'Оформите страховку'}
                            </p>
                        </div>
                    </div>

                    {(osms_type || osms_end_date || patient_fio) && (
                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                            <div>
                                <p className="text-xs opacity-70">Застрахованный</p>
                                <p className="text-sm font-medium">{patient_fio}</p>
                            </div>
                            {osms_type && (
                                <div>
                                    <p className="text-xs opacity-70">Тип пакета</p>
                                    <p className="text-sm font-medium">{osms_type}</p>
                                </div>
                            )}
                            {osms_end_date && (
                                <div>
                                    <p className="text-xs opacity-70">Действует до</p>
                                    <p className="text-sm font-medium">{osms_end_date}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* What's covered */}
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="mb-4 font-semibold text-foreground">Что включено в ОСМС</h3>
                    <div className="space-y-2.5">
                        {coveredServices.map((service, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                                <span className="text-sm text-foreground">{service}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Not covered notice */}
                {!osms_status && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            Для оформления или продления ОСМС обратитесь в отдел кадров, фонд ОСМС или в личный кабинет egov.kz
                        </p>
                    </div>
                )}

                {/* Profile link if data missing */}
                {!osms_type && (
                    <Link
                        href="/patient/profile/edit"
                        className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
                    >
                        Обновить данные в профиле
                    </Link>
                )}
            </div>
        </AppLayout>
    );
}
