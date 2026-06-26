import { Head, Link, router } from '@inertiajs/react';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: '/patient/dashboard' },
    { title: 'Уведомления', href: '/patient/notifications' },
];

interface NotificationItem {
    id: number;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedNotifications {
    data: NotificationItem[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    notifications: PaginatedNotifications;
}

function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Notifications({ notifications }: Props) {
    const [marking, setMarking] = useState<number | null>(null);
    const [markingAll, setMarkingAll] = useState(false);

    const unreadCount = notifications.data.filter((n) => !n.is_read).length;

    const markRead = (id: number) => {
        setMarking(id);
        router.post(route('patient.notifications.read', id), {}, {
            preserveScroll: true,
            onFinish: () => setMarking(null),
        });
    };

    const markAllRead = () => {
        setMarkingAll(true);
        router.post(route('patient.notifications.read-all'), {}, {
            onFinish: () => setMarkingAll(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Уведомления" />

            <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Уведомления</h1>
                            <p className="text-sm text-muted-foreground">
                                {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Всё прочитано'}
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            disabled={markingAll}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Прочитать все
                        </button>
                    )}
                </div>

                {/* List */}
                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
                        <BellOff className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Уведомлений пока нет.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {notifications.data.map((n) => (
                            <div
                                key={n.id}
                                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                                    n.is_read
                                        ? 'border-border bg-card'
                                        : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50'
                                }`}
                            >
                                <div
                                    className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                                        n.is_read ? 'bg-transparent' : 'bg-blue-500'
                                    }`}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm ${n.is_read ? 'text-foreground' : 'font-medium text-foreground'}`}>
                                        {n.message}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                                </div>
                                {!n.is_read && (
                                    <button
                                        onClick={() => markRead(n.id)}
                                        disabled={marking === n.id}
                                        className="shrink-0 rounded-lg px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900"
                                    >
                                        {marking === n.id ? '...' : 'Прочитано'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        {notifications.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm transition-colors ${
                                    link.active
                                        ? 'bg-blue-600 font-medium text-white'
                                        : link.url
                                          ? 'border border-border hover:bg-muted'
                                          : 'cursor-default text-muted-foreground/50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
