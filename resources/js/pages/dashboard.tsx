import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface PatientType {
    id: number;
    name: string;
    phone: string;
    diagnosis: string;
}

interface DashboardProps {
    projectTitle: string;
    userRole: string;
    balance: number;
    patients?: PatientType[]; 
}

export default function Dashboard({ projectTitle, userRole, balance, patients = [] }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                
                {/* Карточки статистики */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border 
                        relative aspect-video overflow-hidden rounded-xl border p-4">
                        <h2 className="text-lg font-bold z-10 relative text-black dark:text-white">{projectTitle}</h2>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border 
                        relative aspect-video overflow-hidden rounded-xl border p-4">
                        <h3 className="text-lg font-semibold z-10 relative text-black dark:text-white">Роль: {userRole}</h3>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border 
                        relative aspect-video overflow-hidden rounded-xl border p-4">
                        <h3 className="text-lg font-semibold z-10 relative text-black dark:text-white">Баланс: {balance} ₸</h3>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>

                {/* Блок списка пациентов */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border 
                    relative min-h-[100vh] flex-1 rounded-xl border md:min-h-min p-6">
                    <h2 className="text-xl font-bold mb-4 text-black dark:text-white relative z-10">Список пациентов из базы данных MySQL:</h2>
                    
                    <div className="grid gap-3 relative z-10">
                        {patients && patients.length > 0 ? (
                            patients.map((patient) => (
                                <div key={patient.id} className="p-4 rounded-lg bg-neutral-100 
                                    dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                    <p className="font-semibold text-lg text-black dark:text-white">{patient.name}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Телефон: {patient.phone}</p>
                                    <p className="text-sm mt-1 text-black dark:text-white">
                                        <span className="font-medium text-neutral-500">Диагноз:</span> {patient.diagnosis}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-neutral-500 relative z-10">Пациентов пока нет или они загружаются...</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

