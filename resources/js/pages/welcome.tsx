import ChatBot from '@/components/chat-bot';
import { useAppearance } from '@/hooks/use-appearance';
import { type Lang, getStoredLang, setStoredLang, t } from '@/i18n';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    Mail,
    Monitor,
    Moon,
    Phone,
    Search,
    Shield,
    Star,
    Sun,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import Spline from '@splinetool/react-spline';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';






const stepsMeta = [
    { icon: Search, color: 'text-blue-600', bg: 'bg-blue-50', titleKey: 'how_step1_title' as const, descKey: 'how_step1_desc' as const },
    { icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', titleKey: 'how_step2_title' as const, descKey: 'how_step2_desc' as const },
    { icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50', titleKey: 'how_step3_title' as const, descKey: 'how_step3_desc' as const },
];

const featuresMeta = [
    { icon: CheckCircle, key: 'feat_no_queue' as const },
    { icon: Clock, key: 'feat_24_7' as const },
    { icon: Shield, key: 'feat_safe' as const },
    { icon: Star, key: 'feat_verified' as const },
];

function useCountUp(target: number, duration = 1800) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = performance.now();
                    const tick = (now: number) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(tick);
                        else setCount(target);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.3 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
}

const LANGS = [
    { value: 'ru' as const, label: 'РУС', full: 'Русский' },
    { value: 'kz' as const, label: 'ҚАЗ', full: 'Қазақша' },
    { value: 'en' as const, label: 'ENG', full: 'English' },
];

const THEMES = [
    { value: 'light' as const, label: 'Светлая', Icon: Sun },
    { value: 'dark' as const, label: 'Тёмная', Icon: Moon },
    { value: 'system' as const, label: 'Системная', Icon: Monitor },
];

function useClickOutside(ref: { current: HTMLElement | null }, handler: () => void) {
    useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) handler();
        };
        document.addEventListener('mousedown', listener);
        return () => document.removeEventListener('mousedown', listener);
    }, [ref, handler]);
}

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, () => setOpen(false));

    const current = LANGS.find((l) => l.value === lang)!;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex h-9 items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
            >
                <span>{current.label}</span>
                <svg className="h-3 w-3 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:shadow-2xl">
                    {LANGS.map(({ value, label, full }) => (
                        <button
                            key={value}
                            onClick={() => { onChange(value); setStoredLang(value); setOpen(false); }}
                            className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${lang === value ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                            <span className="w-8 text-xs font-bold">{label}</span>
                            {full}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ThemeSwitcher() {
    const { appearance, updateAppearance } = useAppearance();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside(ref, () => setOpen(false));

    const current = THEMES.find((t) => t.value === appearance) ?? THEMES[2];

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white/80 text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
            >
                <current.Icon className="h-4 w-4" />
            </button>
            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:shadow-2xl">
                    {THEMES.map(({ value, label, Icon }) => (
                        <button
                            key={value}
                            onClick={() => { updateAppearance(value); setOpen(false); }}
                            className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${appearance === value ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
    const { count, ref } = useCountUp(value);
    return (
        <div ref={ref} className="flex flex-col items-center gap-1 px-4 py-6">
            <p className={`text-2xl font-extrabold tabular-nums lg:text-3xl ${color}`}>
                {count.toLocaleString('ru-RU')}+
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
}

interface Stats { doctors: number; patients: number; appointments: number; }

interface FeaturedReview {
    id: number;
    rating: number;
    text: string | null;
    created_at: string;
    patient: { fio: string } | null;
    branch: { name: string } | null;
}

const VISIBLE = 3;

function ReviewCard({ review, lang }: { review: FeaturedReview; lang: Lang }) {
    return (
        <div data-review-card className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none">
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/60 dark:text-blue-300">
                    {review.patient?.fio?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{review.patient?.fio ?? t(lang, 'reviews_no_name')}</p>
                    <p className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="mb-3 flex">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                ))}
            </div>

            {review.text && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{review.text}</p>}

            {review.branch && <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{review.branch.name}</p>}
        </div>
    );
}

function ReviewsCarousel({ reviews, lang }: { reviews: FeaturedReview[]; lang: Lang }) {
    const [start, setStart] = useState(0);

    if (reviews.length === 0) return null;

    const canPrev = start > 0;
    const canNext = start + VISIBLE < reviews.length;
    const visible = reviews.slice(start, start + VISIBLE);

    return (
        <section data-reviews-section className="bg-slate-100 px-4 py-16 sm:px-6 lg:px-8 dark:bg-slate-900/50">
            <div className="mx-auto max-w-6xl">
                <div data-section-heading className="mb-10 flex items-end justify-between">
                    <div className="text-center sm:text-left">
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">{t(lang, 'reviews_badge')}</p>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t(lang, 'reviews_title')}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStart((s) => s - 1)}
                            disabled={!canPrev}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => setStart((s) => s + 1)}
                            disabled={!canNext}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            ›
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {visible.map((review) => (
                        <ReviewCard key={review.id} review={review} lang={lang} />
                    ))}
                    {visible.length < VISIBLE &&
                        Array.from({ length: VISIBLE - visible.length }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                </div>

                {reviews.length > VISIBLE && (
                    <div className="mt-5 flex justify-center gap-1.5">
                        {Array.from({ length: reviews.length - VISIBLE + 1 }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setStart(i)}
                                className={`h-1.5 rounded-full transition-all ${i === start ? 'w-5 bg-blue-500' : 'w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-500'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function ParallaxClinic({ lang }: { lang: Lang }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;

        const onMove = (e: MouseEvent) => {
            const r = wrap.getBoundingClientRect();
            if (cursorRef.current) {
                cursorRef.current.style.left = `${e.clientX - r.left}px`;
                cursorRef.current.style.top = `${e.clientY - r.top}px`;
                cursorRef.current.style.opacity = '1';
            }
        };

        const onLeave = () => {
            if (cursorRef.current) cursorRef.current.style.opacity = '0';
        };

        wrap.addEventListener('mousemove', onMove);
        wrap.addEventListener('mouseleave', onLeave);
        return () => {
            wrap.removeEventListener('mousemove', onMove);
            wrap.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return (
        <div
            ref={wrapRef}
            className="relative mx-auto select-none"
            style={{ padding: '52px 60px 64px', cursor: 'none', perspective: '1400px', transformStyle: 'preserve-3d' }}
        >

            {/* синее пятно-курсор */}
            <div
                ref={cursorRef}
                className="pointer-events-none absolute z-[20] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/70"
                style={{ opacity: 0, transition: 'opacity 0.15s', filter: 'blur(3px)' }}
            />

            {/* ── Main photo card ── */}
            <div
                data-tilt
                className="relative z-[2] overflow-hidden rounded-3xl shadow-[0_24px_60px_-4px_rgba(99,102,241,0.35),0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
                style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
            >
                <img
                    src="/images/clinic.webp"
                    alt="Поликлиника Baishev University"
                    className="w-full object-cover object-center"
                    style={{ height: '620px', display: 'block' }}
                    draggable={false}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.5) 0%, transparent 60%)' }} />
            </div>

            {/* ── Float-карточка: справа сверху — Рейтинг (parallax) ── */}
            <div
                data-tilt-float
                className="absolute right-0 top-10 z-[1] flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl"
                style={{ willChange: 'transform' }}
            >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                    <p className="text-xl font-extrabold leading-tight text-gray-900">4.9</p>
                    <p className="text-[11px] text-gray-500">{t(lang, 'float_rating')}</p>
                </div>
            </div>

            {/* ── Float-карточка: справа снизу — Запись онлайн (parallax) ── */}
            <div
                data-tilt-float
                className="absolute bottom-12 right-0 z-[3] flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl"
                style={{ willChange: 'transform' }}
            >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                    <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-800">{t(lang, 'float_online')}</p>
                    <p className="text-[11px] text-gray-500">{t(lang, 'float_24_7')}</p>
                </div>
            </div>
        </div>
    );
}

interface DoctorCard {
    id: number;
    fio: string;
    position: string;
    specializations: string[];
    room: string | null;
    branch: string | null;
    initial: string;
    photo: string | null;
    rating_avg: number | null;
    rating_count: number;
}

const avatarGradients = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-violet-600',
    'from-sky-500 to-indigo-600',
];

function DoctorsSection({ doctors, lang }: { doctors: DoctorCard[]; lang: Lang }) {
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? doctors : doctors.slice(0, 4);

    const reviewLabel = (count: number) =>
        count === 1 ? t(lang, 'doctors_reviews_1') : count < 5 ? t(lang, 'doctors_reviews_2_4') : t(lang, 'doctors_reviews_5');

    return (
        <section id="specialties" data-doctors-section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 dark:bg-slate-950">
            <div className="mx-auto max-w-6xl">
                <div data-section-heading className="mb-12 text-center">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">{t(lang, 'doctors_badge')}</p>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t(lang, 'doctors_title')}</h2>
                </div>

                {doctors.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
                        {t(lang, 'doctors_empty')}
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {visible.map((d, i) => (
                                <Link
                                    key={d.id}
                                    href={route('doctors.show', d.id)}
                                    data-doctor-card
                                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-blue-700/50"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-bold leading-tight text-slate-900 dark:text-white">{d.fio}</h3>
                                            {d.rating_avg ? (
                                                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{d.rating_avg}</span>
                                                    <span className="text-slate-400">· {d.rating_count} {reviewLabel(d.rating_count)}</span>
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{t(lang, 'doctors_no_reviews')}</p>
                                            )}
                                        </div>
                                        <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} text-xl font-bold text-white ring-2 ring-slate-100 dark:ring-slate-700`}>
                                            {d.initial}
                                            {d.photo && (
                                                <img src={d.photo} alt={d.fio} className="absolute inset-0 h-full w-full rounded-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            )}
                                        </div>
                                    </div>

                                    <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        {d.specializations.length > 0 ? d.specializations.join(' • ') : d.position}
                                    </p>

                                    <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-blue-700">
                                        <Calendar className="h-4 w-4" />
                                        {t(lang, 'doctors_book_btn')}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {doctors.length > 4 && (
                            <div className="mt-10 text-center">
                                {showAll ? (
                                    <Link
                                        href={route('doctors.index')}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {t(lang, 'doctors_all')} <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setShowAll(true)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {t(lang, 'doctors_show_more')}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default function Welcome() {
    const { auth, stats, featured_reviews, doctors } = usePage<SharedData & { stats: Stats; featured_reviews: FeaturedReview[]; doctors: DoctorCard[] }>().props;

    const [scrolled, setScrolled] = useState(false);
    const [lang, setLang] = useState<Lang>(getStoredLang);
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;
        const floats = hero.querySelectorAll<HTMLElement>('[data-tilt-float]');
        const onMove = (e: MouseEvent) => {
            const r = hero.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            const card = hero.querySelector<HTMLElement>('[data-tilt]');
            if (card) {
                card.style.transform = `perspective(1400px) rotateX(${-y * 12}deg) rotateY(${x * 16}deg) scale(1.02)`;
                card.style.transition = 'transform 0.08s linear';
            }
            floats.forEach((f, i) => {
                const depth = 1.4 + i * 0.25;
                f.style.transform = `perspective(1400px) rotateX(${-y * 12 * depth}deg) rotateY(${x * 16 * depth}deg) translateZ(${60 + i * 20}px) translate(${-x * 40 * depth}px, ${-y * 40 * depth}px)`;
                f.style.transition = 'transform 0.08s linear';
            });
        };
        const onLeave = () => {
            const card = hero.querySelector<HTMLElement>('[data-tilt]');
            if (card) {
                card.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) scale(1)';
                card.style.transition = 'transform 0.7s cubic-bezier(.25,.46,.45,.94)';
            }
            floats.forEach((f) => {
                f.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0px) translate(0px, 0px)';
                f.style.transition = 'transform 0.7s cubic-bezier(.25,.46,.45,.94)';
            });
        };
        hero.addEventListener('mousemove', onMove);
        hero.addEventListener('mouseleave', onLeave);
        return () => {
            hero.removeEventListener('mousemove', onMove);
            hero.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            // Hero: анимация при загрузке страницы
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.fromTo('[data-hero-badge]', { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5 })
              .fromTo('[data-hero-title]', { opacity: 0, y: 40 },  { opacity: 1, y: 0, duration: 0.65 }, '-=0.25')
              .fromTo('[data-hero-sub]',   { opacity: 0, y: 25 },  { opacity: 1, y: 0, duration: 0.5 },  '-=0.35')
              .fromTo('[data-hero-btns]',  { opacity: 0, y: 20 },  { opacity: 1, y: 0, duration: 0.5 },  '-=0.3');

            // Section headings: каждый триггерится отдельно при скролле
            gsap.utils.toArray<HTMLElement>('[data-section-heading]').forEach((el) => {
                gsap.fromTo(el,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
                      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
                );
            });

            // How it works: stagger снизу
            const howCards = gsap.utils.toArray<HTMLElement>('[data-how-card]');
            if (howCards.length) {
                gsap.fromTo(howCards,
                    { opacity: 0, y: 60 },
                    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15,
                      scrollTrigger: { trigger: howCards[0], start: 'top 82%', once: true } }
                );
            }

            // Stats: scale + fade
            gsap.fromTo('[data-stats-block]',
                { opacity: 0, scale: 0.94, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: 'back.out(1.4)',
                  scrollTrigger: { trigger: '[data-stats-block]', start: 'top 85%', once: true } }
            );

            // Doctor cards: stagger снизу
            const doctorCards = gsap.utils.toArray<HTMLElement>('[data-doctor-card]');
            if (doctorCards.length) {
                gsap.fromTo(doctorCards,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1,
                      scrollTrigger: { trigger: '[data-doctors-section]', start: 'top 80%', once: true } }
                );
            }

            // Review cards: slide справа
            const reviewCards = gsap.utils.toArray<HTMLElement>('[data-review-card]');
            if (reviewCards.length) {
                gsap.fromTo(reviewCards,
                    { opacity: 0, x: 50 },
                    { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12,
                      scrollTrigger: { trigger: '[data-reviews-section]', start: 'top 80%', once: true } }
                );
            }

            // Contact cards: stagger снизу
            const contactCards = gsap.utils.toArray<HTMLElement>('[data-contact-card]');
            if (contactCards.length) {
                gsap.fromTo(contactCards,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12,
                      scrollTrigger: { trigger: contactCards[0], start: 'top 85%', once: true } }
                );
            }

            // CTA: zoom + fade
            gsap.fromTo('[data-cta-block]',
                { opacity: 0, scale: 0.96, y: 30 },
                { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'power3.out',
                  scrollTrigger: { trigger: '[data-cta-block]', start: 'top 80%', once: true } }
            );
        });

        return () => ctx.revert();
    }, []);

    const dashboardHref = auth.user?.role === 'patient'
        ? route('patient.dashboard')
        : auth.user?.role === 'doctor'
          ? route('doctor.dashboard')
          : auth.user?.role === 'admin'
            ? route('admin.dashboard')
            : route('dashboard');

    return (
        <>
            <Head title="BU-Med — запись к врачу онлайн" />

            {/* ══ White base — gradient only in hero zone ══ */}
            <div className="min-h-screen bg-white font-sans antialiased dark:bg-slate-950">

                {/* ── HEADER — Frest-style floating bar with padding ── */}
                <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
                    <div className={`mx-auto max-w-7xl rounded-xl transition-all duration-300 ${
                        scrolled
                            ? 'border-2 border-transparent bg-white shadow-lg dark:bg-slate-900'
                            : 'border border-white/50 bg-white/25 backdrop-blur-md dark:border-slate-700/40 dark:bg-slate-900/30'
                    }`}>
                        <div className="flex h-16 items-center justify-between px-6 sm:px-8">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
                                    <img src="/images/baishev_university_logo.png" alt="BaishevMed" className="h-full w-full object-contain" />
                                </div>
                                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">BU Med</span>
                            </div>

                            <nav className="hidden items-center gap-6 md:flex">
                                {([['#how-it-works', t(lang, 'nav_how_it_works')], ['#specialties', t(lang, 'nav_specialists')], ['#contacts', t(lang, 'nav_contacts')], ['#about', t(lang, 'nav_about')]] as [string, string][]).map(([href, label]) => (
                                    <a key={href} href={href} className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                                        {label}
                                    </a>
                                ))}
                            </nav>

                            <div className="flex items-center gap-2.5">
                                <LangSwitcher lang={lang} onChange={setLang} />
                                <ThemeSwitcher />

                                {auth.user ? (
                                    <Link
                                        href={dashboardHref}
                                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500"
                                    >
                                        {t(lang, 'nav_cabinet')}
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800">
                                            {t(lang, 'nav_login')}
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500"
                                        >
                                            {t(lang, 'nav_register')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ══ GRADIENT HERO ZONE — градиент сверху, выпуклый вниз ══ */}
                {/*    ↓ Меняй цвета тут: from / via / to ↓             */}
                <div className="relative -mt-20 bg-white dark:bg-slate-950">
                    {/* градиент закреплён сверху, скруглён снизу (выпуклый вниз) — заходит за header */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[62%] rounded-b-[80px] bg-[linear-gradient(135deg,#dce8f8_0%,#f0e8f8_50%,#fce8e8_100%)] dark:hidden" />
                <section ref={heroRef} className="relative z-[2] pb-24 pt-[120px]">
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        {/* ── Компактный текст сверху — по центру ── */}
                        <div className="mx-auto mb-4 max-w-2xl text-center">
                            <div data-hero-badge className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-4 py-1.5 backdrop-blur-sm dark:border-blue-800/50 dark:bg-blue-900/30">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500 dark:bg-blue-400" />
                                <span className="text-xs font-semibold tracking-wide text-violet-700 dark:text-blue-400">{t(lang, 'hero_badge')}</span>
                            </div>

                            <h1 data-hero-title className="mb-3 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white lg:text-5xl">
                                {t(lang, 'hero_title_1')}{' '}
                                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-violet-400 dark:to-pink-400">{t(lang, 'hero_title_2')}</span>
                                {' '}{t(lang, 'hero_title_3')}
                            </h1>

                            <p data-hero-sub className="mb-6 text-sm text-slate-500 dark:text-slate-400 lg:text-base">
                                {t(lang, 'hero_subtitle')}
                            </p>

                            <div data-hero-btns className="flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    href={auth.user ? dashboardHref : route('register')}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200 dark:hover:shadow-violet-900"
                                >
                                    {t(lang, 'hero_btn_book')} <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-7 py-3 text-sm font-bold text-slate-700 backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700/60"
                                >
                                    {t(lang, 'hero_btn_how')}
                                </a>
                            </div>
                        </div>

                        {/* ── Большое фото с parallax и 4 карточками ── */}
                        <div className="mx-auto max-w-4xl">
                            <ParallaxClinic lang={lang} />
                        </div>
                    </div>
                </section>
                </div>{/* ══ END GRADIENT ZONE ══ */}

                {/* ── HOW IT WORKS — сразу после фото, с отступом сверху ── */}
                {/* ↑ pt-32 = отступ после картинки, py = padding секции ↑ */}
                <section id="how-it-works" className="bg-white px-4 pt-10 pb-24 sm:px-6 lg:px-8 dark:bg-slate-900/40">
                    <div className="mx-auto max-w-5xl">
                        <div data-section-heading className="mb-12 text-center">
                            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">{t(lang, 'how_badge')}</p>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t(lang, 'how_title')}</h2>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-3">
                            {stepsMeta.map((item, i) => (
                                <div key={i} data-how-card className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:shadow-none">
                                    <span className="absolute -top-3 left-6 rounded-full border border-slate-200 bg-white px-3 py-0.5 text-xs font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                                        {i + 1}
                                    </span>
                                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                    <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">{t(lang, item.titleKey)}</h3>
                                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t(lang, item.descKey)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── STATS — цифры пациентов / врачей / записей ──────── */}
                {/* Цвета чисел: color="text-???-600" ниже ↓             */}
                <section className="bg-white px-4 pb-20 sm:px-6 lg:px-8 dark:bg-slate-900/40">
                    <div className="mx-auto max-w-4xl">
                        <div data-stats-block className="grid grid-cols-3 divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                            <StatCard value={stats.patients} label={t(lang, 'stat_patients')} color="text-pink-600 dark:text-pink-400" />
                            <StatCard value={stats.doctors} label={t(lang, 'stat_doctors')} color="text-blue-600 dark:text-blue-400" />
                            <StatCard value={stats.appointments} label={t(lang, 'stat_appointments')} color="text-violet-600 dark:text-violet-400" />
                        </div>
                    </div>
                </section>

                {/* ── DOCTORS — карточки врачей ──────────────────────── */}
                <DoctorsSection doctors={doctors ?? []} lang={lang} />

                {/* ── REVIEWS ────────────────────────────────────────── */}
                <ReviewsCarousel reviews={featured_reviews ?? []} lang={lang} />

                {/* ── MAP / CONTACTS ─────────────────────────────────── */}
                <section id="contacts" className="bg-white px-4 py-20 sm:px-6 lg:px-8 dark:bg-slate-900/40">
                    <div className="mx-auto max-w-6xl">
                        <div data-section-heading className="mb-10 text-center">
                            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">{t(lang, 'contacts_badge')}</p>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t(lang, 'contacts_title')}</h2>
                        </div>

                        <div className="grid overflow-hidden rounded-3xl border border-slate-200 shadow-md lg:grid-cols-2 dark:border-slate-700 dark:shadow-none">
                            <div className="relative min-h-[340px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1938.2300602932612!2d57.15007221115997!3d50.293695871444065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4182239b7994a9bd%3A0x470555ba36732745!2z0JrQu9C40L3QuNC60LAg0JHQsNC50YjQtdCyINCc0JXQlA!5e1!3m2!1sru!2skz!4v1781433520509!5m2!1sru!2skz"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: '340px' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="absolute inset-0 h-full w-full"
                                    title={t(lang, 'map_satellite')}
                                />
                            </div>
                            <div className="relative min-h-[340px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!4v1781432073145!6m8!1m7!1sThWelbNG832J8uizNpCavw!2m2!1d50.2938825003998!2d57.15200037721311!3f135.0760074221601!4f-4.2583142255713256!5f0.7820865974627469"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: '340px' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="absolute inset-0 h-full w-full"
                                    title={t(lang, 'map_street')}
                                />
                            </div>
                        </div>

                        {/* Contact cards */}
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div data-contact-card className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60 dark:shadow-none">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{t(lang, 'contacts_phone_label')}</p>
                                <a href="tel:+77172000000" className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                    +7 (717) 200-00-00
                                </a>
                            </div>

                            <div data-contact-card className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60 dark:shadow-none">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                    <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{t(lang, 'contacts_email_label')}</p>
                                <a href="mailto:e.n.aizharikov@mail.ru" className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                                    {t(lang, 'contacts_email_btn')} <ArrowRight className="h-3.5 w-3.5" />
                                </a>
                            </div>

                            <div data-contact-card className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60 dark:shadow-none">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                                    <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{t(lang, 'contacts_hours_label')}</p>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    <p>{t(lang, 'contacts_hours_weekday')}</p>
                                    <p>{t(lang, 'contacts_hours_sat')}</p>
                                    <p className="text-slate-400 dark:text-slate-600">{t(lang, 'contacts_hours_sun')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                  

                {/* ── CTA ────────────────────────────────────────────── */}
                <section id="about" className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div data-cta-block className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-10 py-14 text-center text-white shadow-2xl">
                            <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
                            <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-500/30" />
                            <p className="relative mb-2 text-xs font-bold uppercase tracking-widest text-blue-200">{t(lang, 'cta_badge')}</p>
                            <h2 className="relative mb-4 text-3xl font-extrabold lg:text-4xl">{t(lang, 'cta_title')}</h2>
                            <p className="relative mx-auto mb-8 max-w-xl text-base text-blue-100">
                                {t(lang, 'cta_subtitle')}
                            </p>

                            <div className="relative mb-8 flex flex-wrap justify-center gap-3">
                                {featuresMeta.map(({ icon: Icon, key }) => (
                                    <div key={key} className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                                        <Icon className="h-4 w-4 text-blue-200" />
                                        {t(lang, key)}
                                    </div>
                                ))}
                            </div>

                            <Link
                                href={auth.user ? dashboardHref : route('register')}
                                className="relative inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                {auth.user ? t(lang, 'cta_btn_cabinet') : t(lang, 'cta_btn_register')}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ─────────────────────────────────────────── */}
                <div className="px-4 pb-6 sm:px-6 lg:px-8">
                    <footer className="rounded-3xl bg-[#2b2d3e] px-8 py-12 text-white">
                        <div className="mx-auto max-w-7xl">
                            <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">

                                {/* Brand + description */}
                                <div className="max-w-xs shrink-0">
                                    <div className="mb-4 flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/10">
                                            <img src="/images/baishev_university_logo.png" alt="BaishevMed" className="h-full w-full object-contain p-1" />
                                        </div>
                                        <span className="text-base font-bold text-white">BU-Med</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-400">
                                        Онлайн-сервис для записи к врачу в поликлиниках Baishev University. Быстро, удобно, безопасно.
                                    </p>
                                </div>

                                {/* Links grid */}
                                <div className="grid grid-cols-2 gap-10 sm:gap-16 md:grid-cols-3">
                                    <div>
                                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Пациентам</h3>
                                        <ul className="space-y-3">
                                            <li><Link href={route('register')} className="text-sm text-slate-300 transition-colors hover:text-white">{t(lang, 'nav_register')}</Link></li>
                                            <li><Link href={route('login')} className="text-sm text-slate-300 transition-colors hover:text-white">{t(lang, 'nav_login')}</Link></li>
                                            <li><Link href={route('doctors.index')} className="text-sm text-slate-300 transition-colors hover:text-white">{t(lang, 'nav_specialists')}</Link></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Навигация</h3>
                                        <ul className="space-y-3">
                                            <li><a href="#how-it-works" className="text-sm text-slate-300 transition-colors hover:text-white">{t(lang, 'nav_how_it_works')}</a></li>
                                            <li><a href="#specialties" className="text-sm text-slate-300 transition-colors hover:text-white">{t(lang, 'nav_specialists')}</a></li>
                                            <li><a href="#contacts" className="text-sm text-slate-300 transition-colors hover:text-white">{t(lang, 'nav_contacts')}</a></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Контакты</h3>
                                        <ul className="space-y-3">
                                            <li>
                                                <a href="tel:+77172000000" className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white">
                                                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                                                    +7 (717) 200-00-00
                                                </a>
                                            </li>
                                            <li>
                                                <a href="mailto:med@baishev.edu.kz" className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white">
                                                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                                                    med@baishev.edu.kz
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom bar */}
                            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
                                <p className="text-xs text-slate-500">
                                    © {new Date().getFullYear()} BU-Med — Baishev University. Все права защищены.
                                </p>
                                <div className="flex items-center gap-4">
                                    <a href="#" className="text-slate-500 transition-colors hover:text-white">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                                    </a>
                                    <a href="#" className="text-slate-500 transition-colors hover:text-white">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                                    </a>
                                    <a href="#" className="text-slate-500 transition-colors hover:text-white">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            <ChatBot />
        </>
    );
}
