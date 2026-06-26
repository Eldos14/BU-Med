import { Head } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Панель врача', href: '/doctor/dashboard' },
    { title: 'График', href: '/doctor/schedule' },
];

interface Appointment {
    id: number;
    date: string;
    patient_name: string;
    start_time: string;
    end_time: string | null;
    reason: string | null;
    status: 'planned' | 'completed' | 'cancelled';
}

interface Props {
    appointments: Appointment[];
    today: string;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

const statusColor: Record<string, string> = {
    planned: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-400',
};
const statusBadge: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
};
const statusLabel: Record<string, string> = {
    planned: 'Запланировано',
    completed: 'Принято',
    cancelled: 'Отменено',
};

function toDateKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Monday-first calendar grid for a given month
function buildCalendarDays(year: number, month: number): (number | null)[] {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay === 0 ? 6 : firstDay - 1); // shift to Monday=0
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

export default function DoctorSchedule({ appointments, today }: Props) {
    const todayDate = new Date(today + 'T00:00:00');
    const [year, setYear] = useState(todayDate.getFullYear());
    const [month, setMonth] = useState(todayDate.getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(today);

    // mini-calendar state (follows main)
    const [miniYear, setMiniYear] = useState(todayDate.getFullYear());
    const [miniMonth, setMiniMonth] = useState(todayDate.getMonth());

    const apptMap = useMemo(() => {
        const m: Record<string, Appointment[]> = {};
        for (const a of appointments) {
            if (!m[a.date]) m[a.date] = [];
            m[a.date].push(a);
        }
        return m;
    }, [appointments]);

    const calDays = useMemo(() => buildCalendarDays(year, month), [year, month]);
    const miniCalDays = useMemo(() => buildCalendarDays(miniYear, miniMonth), [miniYear, miniMonth]);

    const selectedAppts = selectedDate ? (apptMap[selectedDate] ?? []) : [];

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    };
    const miniPrev = () => {
        if (miniMonth === 0) { setMiniYear(y => y - 1); setMiniMonth(11); }
        else setMiniMonth(m => m - 1);
    };
    const miniNext = () => {
        if (miniMonth === 11) { setMiniYear(y => y + 1); setMiniMonth(0); }
        else setMiniMonth(m => m + 1);
    };

    const goToToday = () => {
        setYear(todayDate.getFullYear()); setMonth(todayDate.getMonth());
        setMiniYear(todayDate.getFullYear()); setMiniMonth(todayDate.getMonth());
        setSelectedDate(today);
    };

    const selectDay = (d: number) => {
        const key = toDateKey(year, month, d);
        setSelectedDate(key);
    };

    const selectMiniDay = (d: number) => {
        const key = toDateKey(miniYear, miniMonth, d);
        setYear(miniYear); setMonth(miniMonth);
        setSelectedDate(key);
    };

    // upcoming 5 appointments from today
    const upcoming = appointments
        .filter(a => a.date >= today && a.status !== 'cancelled')
        .slice(0, 5);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="График работы" />

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* ── LEFT SIDEBAR ── */}
                <aside className="flex w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-border bg-card p-4">
                    {/* Mini calendar */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <button onClick={miniPrev} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <p className="text-xs font-semibold text-foreground">
                                {MONTHS[miniMonth]} {miniYear}
                            </p>
                            <button onClick={miniNext} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-0.5">
                            {WEEKDAYS.map(w => (
                                <div key={w} className="py-0.5 text-center text-[10px] font-semibold text-muted-foreground">{w}</div>
                            ))}
                            {miniCalDays.map((d, i) => {
                                if (!d) return <div key={i} />;
                                const key = toDateKey(miniYear, miniMonth, d);
                                const hasAppt = !!apptMap[key]?.length;
                                const isSel = key === selectedDate;
                                const isTod = key === today;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => selectMiniDay(d)}
                                        className={`relative flex h-7 w-full items-center justify-center rounded text-xs font-medium transition-colors ${
                                            isSel ? 'bg-blue-600 text-white' :
                                            isTod ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                                            'text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {d}
                                        {hasAppt && !isSel && (
                                            <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filter legend */}
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Статусы</p>
                        <div className="flex flex-col gap-1.5">
                            {(['planned','completed','cancelled'] as const).map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full ${statusColor[s]}`} />
                                    <span className="text-xs text-foreground">{statusLabel[s]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming */}
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Ближайшие</p>
                        {upcoming.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Нет записей</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {upcoming.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => { setYear(parseInt(a.date.slice(0,4))); setMonth(parseInt(a.date.slice(5,7))-1); setSelectedDate(a.date); }}
                                        className="flex items-start gap-2 rounded-lg border border-border p-2 text-left hover:bg-muted/40"
                                    >
                                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${statusColor[a.status]}`} />
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-medium text-foreground">{a.patient_name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {a.date.slice(8,10)} {MONTHS_GEN[parseInt(a.date.slice(5,7))-1]}, {a.start_time}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── MAIN CALENDAR ── */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToToday}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                            >
                                Сегодня
                            </button>
                            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <h2 className="ml-1 text-base font-bold text-foreground">
                                {MONTHS[month]} {year}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                                {appointments.filter(a => a.status !== 'cancelled').length} записей всего
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Calendar grid */}
                        <div className="flex flex-1 flex-col overflow-hidden">
                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
                                {WEEKDAYS.map(w => (
                                    <div key={w} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                                        {w}
                                    </div>
                                ))}
                            </div>

                            {/* Day cells */}
                            <div className="grid flex-1 grid-cols-7" style={{ gridTemplateRows: `repeat(${calDays.length / 7}, 1fr)` }}>
                                {calDays.map((d, i) => {
                                    if (!d) {
                                        return <div key={i} className="border-b border-r border-border bg-muted/10 last:border-r-0" />;
                                    }
                                    const key = toDateKey(year, month, d);
                                    const dayAppts = apptMap[key] ?? [];
                                    const isTod = key === today;
                                    const isSel = key === selectedDate;
                                    const isWeekend = i % 7 >= 5;

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => selectDay(d)}
                                            className={`group cursor-pointer overflow-hidden border-b border-r border-border p-1 transition-colors last:border-r-0 ${
                                                isSel ? 'bg-blue-50 dark:bg-blue-950/30' :
                                                isWeekend ? 'bg-slate-50/50 dark:bg-muted/10' :
                                                'bg-background hover:bg-muted/20'
                                            }`}
                                        >
                                            {/* Day number */}
                                            <div className="mb-1 flex justify-end pr-1 pt-0.5">
                                                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                                    isTod ? 'bg-blue-600 text-white' :
                                                    isSel ? 'text-blue-600 dark:text-blue-400' :
                                                    isWeekend ? 'text-muted-foreground' :
                                                    'text-foreground'
                                                }`}>
                                                    {d}
                                                </span>
                                            </div>

                                            {/* Events (max 3 visible) */}
                                            <div className="flex flex-col gap-0.5">
                                                {dayAppts.slice(0, 3).map(a => (
                                                    <div
                                                        key={a.id}
                                                        className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium text-white ${statusColor[a.status]}`}
                                                    >
                                                        <span className="truncate">{a.start_time} {a.patient_name.split(' ')[0]}</span>
                                                    </div>
                                                ))}
                                                {dayAppts.length > 3 && (
                                                    <span className="pl-1 text-[10px] text-muted-foreground">
                                                        +{dayAppts.length - 3} ещё
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── DAY DETAIL PANEL ── */}
                        {selectedDate && (
                            <div className="flex w-64 shrink-0 flex-col overflow-y-auto border-l border-border bg-card">
                                <div className="border-b border-border px-4 py-3">
                                    <p className="text-sm font-bold text-foreground">
                                        {(() => {
                                            const d = new Date(selectedDate + 'T00:00:00');
                                            return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`;
                                        })()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedAppts.length === 0 ? 'Нет записей' :
                                         `${selectedAppts.length} ${selectedAppts.length === 1 ? 'запись' : selectedAppts.length < 5 ? 'записи' : 'записей'}`}
                                    </p>
                                </div>

                                {selectedAppts.length === 0 ? (
                                    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                                        <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
                                        <p className="text-xs text-muted-foreground">В этот день записей нет</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-0 divide-y divide-border">
                                        {selectedAppts
                                            .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                            .map(a => (
                                            <div key={a.id} className="px-4 py-3">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3 w-3 text-blue-500" />
                                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{a.start_time}</span>
                                                        {a.end_time && <span className="text-[10px] text-muted-foreground">– {a.end_time}</span>}
                                                    </div>
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[a.status]}`}>
                                                        {statusLabel[a.status]}
                                                    </span>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                                                        {a.patient_name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-foreground">{a.patient_name}</p>
                                                        {a.reason && <p className="truncate text-[10px] text-muted-foreground">{a.reason}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
