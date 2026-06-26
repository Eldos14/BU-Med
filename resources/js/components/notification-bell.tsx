import { router, usePage } from '@inertiajs/react';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { type SharedData } from '@/types';

export function NotificationBell() {
    const { notifications, auth } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!auth?.user || !notifications) return null;

    const { unread_count, recent } = notifications;

    const markRead = (id: number) => {
        router.post(route('notifications.mark', id), {}, { preserveScroll: true });
    };

    const markAll = () => {
        router.post(route('notifications.mark-all'), {}, { preserveScroll: true });
    };

    const allLink = auth.user.role === 'patient' ? '/patient/notifications' : '/doctor/notifications';

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
                <Bell className="h-5 w-5" />
                {unread_count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unread_count > 9 ? '9+' : unread_count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-white shadow-xl dark:bg-card">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold text-foreground">Уведомления</span>
                            {unread_count > 0 && (
                                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600 dark:bg-red-950 dark:text-red-400">
                                    {unread_count}
                                </span>
                            )}
                        </div>
                        {unread_count > 0 && (
                            <button
                                onClick={markAll}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Прочитать все
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {recent.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                <BellOff className="h-8 w-8 text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">Уведомлений пока нет</p>
                            </div>
                        ) : (
                            recent.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => !n.is_read && markRead(n.id)}
                                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-muted/30 ${
                                        !n.is_read ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''
                                    }`}
                                >
                                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm leading-snug ${!n.is_read ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
                                            {n.message}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">{n.created_at}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border px-4 py-2.5 text-center">
                        <a
                            href={allLink}
                            onClick={() => setOpen(false)}
                            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Все уведомления
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
