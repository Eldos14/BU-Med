import { Head, Link, useForm } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Search, User, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Панель врача', href: '/doctor/dashboard' },
    { title: 'Создать запись', href: '/doctor/appointments/create' },
];

interface PatientResult {
    id: number;
    fio: string;
    email: string;
    iin: string;
    photo: string | null;
}

interface HistoryItem {
    id: number;
    date: string;
    time: string;
    reason: string;
    status: string;
    doctor: string;
}

interface BookingForm {
    [key: string]: string;
    patient_id: string;
    start_time: string;
    end_time: string;
    reason: string;
}

const SLOT_START = 8;
const SLOT_END = 18;

function buildTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = SLOT_START; h < SLOT_END; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
}

const TIME_SLOTS = buildTimeSlots();
const DURATIONS = [
    { label: '30 мин', mins: 30 },
    { label: '1 час', mins: 60 },
    { label: '1.5 ч', mins: 90 },
    { label: '2 часа', mins: 120 },
];

const STATUS_LABEL: Record<string, string> = {
    planned: 'Запланирован',
    completed: 'Завершён',
    cancelled: 'Отменён',
};

const STATUS_COLOR: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
};

function addMinutes(time: string, mins: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + mins;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
}

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function PatientAvatar({ patient, size = 'md' }: { patient: PatientResult; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClass = size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
    if (patient.photo) {
        return (
            <img
                src={patient.photo}
                alt={patient.fio}
                className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-card`}
            />
        );
    }
    return (
        <div className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white`}>
            {patient.fio.charAt(0).toUpperCase()}
        </div>
    );
}

export default function DoctorAppointmentCreate() {
    const { data, setData, post, processing, errors } = useForm<BookingForm>({
        patient_id: '',
        start_time: '',
        end_time: '',
        reason: '',
    });

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [duration, setDuration] = useState(30);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PatientResult[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);
    const [searching, setSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const doSearch = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        setSearching(true);
        try {
            const res = await fetch(`/doctor/patients/search?q=${encodeURIComponent(q)}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const json = await res.json();
            setResults(json);
            setShowDropdown(true);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(query), 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, doSearch]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchHistory = async (patientId: number) => {
        setLoadingHistory(true);
        setHistory([]);
        try {
            const res = await fetch(`/doctor/patients/${patientId}/brief-history`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const json = await res.json();
            setHistory(json);
        } catch {
            setHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const selectPatient = (p: PatientResult) => {
        setSelectedPatient(p);
        setData('patient_id', String(p.id));
        setQuery('');
        setShowDropdown(false);
        setResults([]);
        fetchHistory(p.id);
    };

    const clearPatient = () => {
        setSelectedPatient(null);
        setData('patient_id', '');
        setHistory([]);
    };

    const selectDay = (day: number) => {
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setSelectedSlot('');
        setData('start_time', '');
        setData('end_time', '');
    };

    const selectSlot = (slot: string) => {
        setSelectedSlot(slot);
        setData('start_time', `${selectedDate}T${slot}`);
        setData('end_time', `${selectedDate}T${addMinutes(slot, duration)}`);
    };

    const handleDurationChange = (mins: number) => {
        setDuration(mins);
        if (selectedSlot && selectedDate) {
            setData('end_time', `${selectedDate}T${addMinutes(selectedSlot, mins)}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('doctor.appointments.store'));
    };

    const calDays = buildCalendarDays(calYear, calMonth);

    const prevMonth = () => {
        if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
        else setCalMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
        else setCalMonth(m => m + 1);
    };

    const isSlotDisabled = (slot: string) => {
        if (!selectedDate) return true;
        if (addMinutes(slot, duration) > `${SLOT_END}:00`) return true;
        if (selectedDate === todayStr) {
            const nowHHMM = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
            if (slot <= nowHHMM) return true;
        }
        return false;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Создать запись" />

            <div className="min-h-screen bg-slate-50 dark:bg-background">
                {/* Header */}
                <div className="border-b border-border bg-white px-6 py-5 dark:bg-card">
                    <div className="mx-auto flex max-w-5xl items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Создать запись</h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">Запишите пациента на прием</p>
                        </div>
                        <Link
                            href="/doctor/dashboard"
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-slate-50 dark:hover:bg-muted/30"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Назад
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 p-5 lg:grid-cols-2">

                        {/* ─── LEFT COLUMN ─── */}
                        <div className="flex flex-col gap-5">

                            {/* Patient search */}
                            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                                <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                    <User className="h-4 w-4 text-blue-500" />
                                    Пациент
                                </h2>

                                {selectedPatient ? (
                                    <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/40">
                                        <PatientAvatar patient={selectedPatient} size="md" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-foreground">{selectedPatient.fio}</p>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                                                {selectedPatient.email && (
                                                    <span className="truncate text-xs text-muted-foreground">{selectedPatient.email}</span>
                                                )}
                                                {selectedPatient.iin && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                        ИИН: {selectedPatient.iin}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearPatient}
                                            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-blue-100 hover:text-foreground dark:hover:bg-blue-900"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div ref={searchRef} className="relative">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                onFocus={() => results.length > 0 && setShowDropdown(true)}
                                                placeholder="ФИО, email или ИИН..."
                                                className="w-full rounded-xl border border-input bg-white py-2.5 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/20"
                                            />
                                            {searching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                                                </div>
                                            )}
                                        </div>

                                        {showDropdown && results.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg dark:bg-card">
                                                {results.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => selectPatient(p)}
                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-muted/30"
                                                    >
                                                        <PatientAvatar patient={p} size="sm" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-foreground">{p.fio}</p>
                                                            <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                                                        </div>
                                                        {p.iin && (
                                                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-muted">
                                                                {p.iin}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {showDropdown && !searching && query.length >= 2 && results.length === 0 && (
                                            <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground shadow-lg dark:bg-card">
                                                Пациенты не найдены
                                            </div>
                                        )}
                                    </div>
                                )}

                                {errors.patient_id && (
                                    <p className="mt-2 text-xs text-red-600">{errors.patient_id}</p>
                                )}
                            </div>

                            {/* Calendar date picker */}
                            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                                <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    Дата приема
                                </h2>

                                <div className="mb-3 flex items-center justify-between">
                                    <button type="button" onClick={prevMonth} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 dark:hover:bg-muted">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-semibold text-foreground">
                                        {MONTH_NAMES[calMonth]} {calYear}
                                    </span>
                                    <button type="button" onClick={nextMonth} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 dark:hover:bg-muted">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="mb-1 grid grid-cols-7 gap-0.5">
                                    {DAY_NAMES.map((d) => (
                                        <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-0.5">
                                    {calDays.map((day, i) => {
                                        if (!day) return <div key={`e-${i}`} />;
                                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const isPast = dateStr < todayStr;
                                        const isToday = dateStr === todayStr;
                                        const isSelected = dateStr === selectedDate;
                                        const isWeekend = i % 7 === 5 || i % 7 === 6;
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                disabled={isPast}
                                                onClick={() => selectDay(day)}
                                                className={`flex h-9 items-center justify-center rounded-lg text-sm transition-all
                                                    ${isSelected ? 'bg-blue-600 font-bold text-white shadow-sm' :
                                                      isToday ? 'border border-blue-400 font-semibold text-blue-600' :
                                                      isPast ? 'cursor-not-allowed text-muted-foreground/40' :
                                                      isWeekend ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30' :
                                                      'text-foreground hover:bg-slate-100 dark:hover:bg-muted/40'}`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedDate && (
                                    <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
                                            weekday: 'long', day: 'numeric', month: 'long',
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Patient history — shown only when patient is selected */}
                            {selectedPatient && (
                                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                                    <div className="mb-4 flex items-center gap-3">
                                        <PatientAvatar patient={selectedPatient} size="lg" />
                                        <div>
                                            <p className="font-semibold text-foreground">{selectedPatient.fio}</p>
                                            <p className="text-xs text-muted-foreground">{selectedPatient.email}</p>
                                            {selectedPatient.iin && (
                                                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-muted">
                                                    ИИН: {selectedPatient.iin}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-foreground">История визитов</h3>
                                        <Link
                                            href={`/doctor/patients/${selectedPatient.id}/history`}
                                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            Все записи →
                                        </Link>
                                    </div>

                                    {loadingHistory ? (
                                        <div className="flex flex-col gap-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-muted/40" />
                                            ))}
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                                            Визитов пока нет
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {history.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-foreground">{item.reason}</p>
                                                        <p className="text-xs text-muted-foreground">{item.date} · {item.time} · {item.doctor}</p>
                                                    </div>
                                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                        {STATUS_LABEL[item.status] ?? item.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ─── RIGHT COLUMN ─── */}
                        <div className="flex flex-col gap-5">

                            {/* Time slots */}
                            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                                <h2 className="mb-1 flex items-center gap-2 font-semibold text-foreground">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    Время приема
                                </h2>

                                {!selectedDate ? (
                                    <p className="mt-4 text-center text-sm text-muted-foreground">Сначала выберите дату</p>
                                ) : (
                                    <>
                                        <div className="mb-4 mt-3 flex flex-wrap gap-2">
                                            {DURATIONS.map((d) => (
                                                <button
                                                    key={d.mins}
                                                    type="button"
                                                    onClick={() => handleDurationChange(d.mins)}
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                                        duration === d.mins
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted/70'
                                                    }`}
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-4 gap-1.5">
                                            {TIME_SLOTS.map((slot) => {
                                                const disabled = isSlotDisabled(slot);
                                                const selected = slot === selectedSlot;
                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        disabled={disabled}
                                                        onClick={() => selectSlot(slot)}
                                                        className={`rounded-lg py-2 text-xs font-medium transition-all ${
                                                            selected
                                                                ? 'bg-blue-600 text-white shadow-sm'
                                                                : disabled
                                                                ? 'cursor-not-allowed bg-slate-50 text-muted-foreground/40 dark:bg-muted/20'
                                                                : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-muted/40 dark:text-muted-foreground dark:hover:bg-blue-950/40'
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {selectedSlot && (
                                            <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                                {selectedSlot} — {addMinutes(selectedSlot, duration)}&nbsp;
                                                <span className="opacity-70">({DURATIONS.find((d) => d.mins === duration)?.label})</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {(errors.start_time || errors.end_time) && (
                                    <p className="mt-2 text-xs text-red-600">{errors.start_time || errors.end_time}</p>
                                )}
                            </div>

                            {/* Reason */}
                            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                                <label className="mb-3 block font-semibold text-foreground">Причина визита</label>
                                <input
                                    type="text"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Консультация, осмотр, плановый прием..."
                                    className="w-full rounded-xl border border-input bg-white px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-muted/20"
                                />
                                {errors.reason && (
                                    <p className="mt-1 text-xs text-red-600">{errors.reason}</p>
                                )}
                            </div>

                            {/* Summary + Submit */}
                            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                                {(selectedPatient || selectedDate || selectedSlot) && (
                                    <div className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-muted/20">
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Сводка</p>
                                        <div className="space-y-1.5 text-sm">
                                            {selectedPatient && (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                    <span className="text-foreground">{selectedPatient.fio}</span>
                                                </div>
                                            )}
                                            {selectedDate && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                    <span className="text-foreground">
                                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
                                                            day: 'numeric', month: 'long', year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedSlot && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                    <span className="text-foreground">{selectedSlot} — {addMinutes(selectedSlot, duration)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing || !data.patient_id || !data.start_time || !data.reason}
                                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {processing ? 'Сохраняю...' : 'Создать запись'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
