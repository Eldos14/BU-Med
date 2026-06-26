import { Head, Link, router } from '@inertiajs/react';
import { Activity, ArrowLeft, Calendar, Search, Stethoscope } from 'lucide-react';
import { useState } from 'react';

interface Doctor {
    id: number;
    fio: string;
    position: string;
    contacts: string | null;
    specializations: string;
    room: string | null;
    initial: string;
    photo: string | null;
}

interface Props {
    doctors: Doctor[];
    search: string;
}

const avatarColors = [
    'from-blue-500 to-blue-700',
    'from-violet-500 to-violet-700',
    'from-emerald-500 to-emerald-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-amber-700',
    'from-teal-500 to-teal-700',
];

const popularTags = ['Терапевт', 'Кардиолог', 'Педиатр', 'Невролог', 'Хирург', 'Офтальмолог', 'Дерматолог', 'Гинеколог'];

export default function PublicDoctors({ doctors, search }: Props) {
    const [query, setQuery] = useState(search);

    const doSearch = (q: string) => {
        router.get(route('doctors.index'), q ? { search: q } : {}, { preserveState: true, replace: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        doSearch(query);
    };

    return (
        <>
            <Head title={search ? `Врачи — ${search}` : 'Найти врача — BaishevMed'} />

            <div className="min-h-screen bg-slate-50 font-sans antialiased">

                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href={route('home')} className="flex items-center gap-2.5 text-gray-700 transition-colors hover:text-blue-600">
                            <ArrowLeft className="h-4 w-4" />
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
                                    <img src="/images/baishev_university_logo.png" alt="" className="h-full w-full object-contain" />
                                </div>
                                <span className="text-base font-bold text-gray-900">BaishevMed</span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <Link href={route('login')} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                                Войти
                            </Link>
                            <Link href={route('register')} className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800">
                                Регистрация
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Search hero */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-10 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="mb-2 text-2xl font-extrabold text-white lg:text-3xl">
                            {search ? `Результаты: «${search}»` : 'Найти врача'}
                        </h1>
                        <p className="mb-6 text-sm text-blue-100">Выберите специалиста и запишитесь онлайн</p>

                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg">
                                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Специальность или имя врача..."
                                    className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition-colors hover:bg-blue-50"
                            >
                                Найти
                            </button>
                        </form>

                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {popularTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => { setQuery(tag); doSearch(tag); }}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                                        search === tag
                                            ? 'bg-white text-blue-700'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {doctors.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-20 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                <Stethoscope className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700">Врачи не найдены</p>
                            <p className="text-sm text-gray-400">Попробуйте другой запрос</p>
                            <button
                                onClick={() => { setQuery(''); doSearch(''); }}
                                className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Показать всех врачей
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="mb-6 text-sm text-gray-500">
                                Найдено: <span className="font-semibold text-gray-800">{doctors.length}</span> {doctors.length === 1 ? 'врач' : doctors.length < 5 ? 'врача' : 'врачей'}
                            </p>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {doctors.map((d, i) => (
                                    <div
                                        key={d.id}
                                        className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        {/* Avatar */}
                                        <div className={`relative flex h-32 items-center justify-center rounded-t-2xl overflow-hidden bg-gradient-to-br ${avatarColors[i % avatarColors.length]}`}>
                                            <span className="text-4xl font-extrabold text-white/90">{d.initial}</span>
                                            {d.photo && (
                                                <img src={d.photo} alt={d.fio} className="absolute inset-0 h-full w-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            )}
                                            {d.specializations && (
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                                                        {d.specializations}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex flex-1 flex-col p-4">
                                            <h3 className="mb-0.5 font-bold text-gray-900 leading-tight">{d.fio}</h3>
                                            <p className="mb-3 text-sm text-gray-500">{d.position}</p>

                                            <div className="mt-auto flex flex-col gap-1.5">
                                                {d.room && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <Activity className="h-3.5 w-3.5" />
                                                        Кабинет {d.room}
                                                    </div>
                                                )}
                                                {d.contacts && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <span>{d.contacts}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="border-t border-gray-100 p-4">
                                            <Link
                                                href={route('register')}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                            >
                                                <Calendar className="h-4 w-4" />
                                                Записаться
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} BaishevMed — Baishev University
                </footer>
            </div>
        </>
    );
}
