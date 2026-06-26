import { ChevronDown, MessageSquare, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const faqs = [
    { q: 'Как записаться к врачу?', a: 'Зарегистрируйтесь на сайте, выберите врача и удобное время. Запись доступна 24/7 в личном кабинете.' },
    { q: 'Режим работы', a: 'Пн — Пт: 08:00 — 20:00\nСб: 09:00 — 16:00\nВс: выходной' },
    { q: 'Адрес клиники', a: 'г. Актобе, ул. Ленина, 33А\nУниверситет имени Баишева' },
    { q: 'Работаете с ОСМС?', a: 'Да, принимаем по ОСМС. Убедитесь, что ваш статус активен — проверить можно в личном кабинете после регистрации.' },
    { q: 'Какие специалисты есть?', a: 'Терапевты, кардиологи, педиатры, неврологи, хирурги, офтальмологи, дерматологи и гинекологи.' },
    { q: 'Как отменить запись?', a: 'Личный кабинет → «Мои записи» → кнопка «Отменить».' },
    { q: 'Телефон / Email', a: 'Телефон: +7 (717) 200-00-00\nEmail: med@baishev.edu.kz' },
];

interface Message {
    id: number;
    from: 'bot' | 'user';
    text: string;
}

const INITIAL: Message[] = [
    { id: 0, from: 'bot', text: 'Привет! Я бот BaishevMed 👋\nЗадайте вопрос — выберите из списка ниже.' },
];

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(INITIAL);
    const [typing, setTyping] = useState(false);
    const [asked, setAsked] = useState<Set<string>>(new Set());
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    const ask = (faq: { q: string; a: string }) => {
        if (typing) return;
        setAsked((prev) => new Set(prev).add(faq.q));
        setMessages((prev) => [...prev, { id: Date.now(), from: 'user', text: faq.q }]);
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: faq.a }]);
        }, 800);
    };

    const reset = () => {
        setMessages(INITIAL);
        setAsked(new Set());
        setTyping(false);
    };

    const remaining = faqs.filter((f) => !asked.has(f.q));

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-all hover:scale-105 hover:bg-blue-700"
                aria-label="Открыть чат"
            >
                {open ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
            </button>

            {/* Chat window */}
            {open && (
                <div className="fixed right-6 bottom-24 z-50 flex w-[340px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:w-[380px]">
                    {/* Header */}
                    <div className="flex items-center gap-3 bg-blue-600 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                            <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">BaishevMed Бот</p>
                            <p className="flex items-center gap-1 text-xs text-blue-100">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                                Онлайн
                            </p>
                        </div>
                        <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white">
                            <ChevronDown className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex h-72 flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[82%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                        m.from === 'user'
                                            ? 'rounded-br-sm bg-blue-600 text-white'
                                            : 'rounded-bl-sm border border-gray-100 bg-white text-gray-800 shadow-sm'
                                    }`}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}

                        {typing && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* FAQ buttons */}
                    <div className="border-t border-gray-100 bg-white p-3">
                        {remaining.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {remaining.map((f) => (
                                    <button
                                        key={f.q}
                                        onClick={() => ask(f)}
                                        disabled={typing}
                                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                                    >
                                        {f.q}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-1">
                                <p className="text-xs text-gray-400">Все вопросы заданы</p>
                                <button
                                    onClick={reset}
                                    className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Начать заново
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
