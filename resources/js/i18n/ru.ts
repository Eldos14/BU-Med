const ru = {
    // ── Header nav ──
    nav_how_it_works: 'Как это работает',
    nav_specialists: 'Специальности',
    nav_contacts: 'Контакты',
    nav_about: 'О нас',
    nav_login: 'Войти',
    nav_register: 'Регистрация',
    nav_cabinet: 'Личный кабинет',

    // ── Hero ──
    hero_badge: 'Медицинский портал — Baishev University',
    hero_title_1: 'Найдите нужного',
    hero_title_2: 'специалиста',
    hero_title_3: 'и запишитесь онлайн',
    hero_subtitle: 'Удобная запись к врачу для студентов и сотрудников Baishev University.',
    hero_btn_book: 'Записаться к врачу',
    hero_btn_how: 'Как это работает',

    // ── Float badges ──
    float_rating: 'Рейтинг клиники',
    float_online: 'Запись онлайн',
    float_24_7: '24/7 · Без очередей',

    // ── How it works ──
    how_badge: 'Просто и быстро',
    how_title: 'Как это работает',
    how_step1_title: 'Найдите врача',
    how_step1_desc: 'Выберите специалиста по специальности, поликлинике или имени.',
    how_step2_title: 'Запишитесь онлайн',
    how_step2_desc: 'Выберите удобную дату и время приёма в онлайн-расписании.',
    how_step3_title: 'Посетите приём',
    how_step3_desc: 'Придите в поликлинику в назначенное время без ожидания.',

    // ── Stats ──
    stat_patients: 'Пациентов',
    stat_doctors: 'Врачей',
    stat_appointments: 'Записей',

    // ── Doctors ──
    doctors_badge: 'Команда',
    doctors_title: 'Наши специалисты',
    doctors_empty: 'Врачи скоро появятся',
    doctors_no_reviews: 'Нет отзывов',
    doctors_reviews_1: 'отзыв',
    doctors_reviews_2_4: 'отзыва',
    doctors_reviews_5: 'отзывов',
    doctors_book_btn: 'Записаться',
    doctors_show_more: 'Показать ещё',
    doctors_all: 'Все врачи',

    // ── Reviews ──
    reviews_badge: 'Мнения пациентов',
    reviews_title: 'Отзывы',
    reviews_no_name: 'Без имени',

    // ── Contacts ──
    contacts_badge: 'Местоположение',
    contacts_title: 'Как нас найти',
    contacts_phone_label: 'Телефонная помощь',
    contacts_email_label: 'Связаться по Email',
    contacts_email_btn: 'Написать сейчас',
    contacts_hours_label: 'Режим работы',
    contacts_hours_weekday: 'Пн — Пт: 08:00 — 20:00',
    contacts_hours_sat: 'Сб: 09:00 — 16:00',
    contacts_hours_sun: 'Вс: выходной',

    // ── CTA ──
    cta_badge: 'Начните сейчас',
    cta_title: 'Первый шаг к здоровью — за вами',
    cta_subtitle: 'Зарегистрируйтесь и получите доступ к онлайн-записи, истории визитов и уведомлениям.',
    cta_btn_register: 'Зарегистрироваться бесплатно',
    cta_btn_cabinet: 'Личный кабинет',

    // ── Features (CTA icons) ──
    feat_no_queue: 'Без очередей',
    feat_24_7: 'Запись 24/7',
    feat_safe: 'Безопасно',
    feat_verified: 'Проверенные врачи',

    // ── Footer / map ──
    map_satellite: 'Карта — спутник',
    map_street: 'Карта — вид улицы',
} as const;

export default ru;
export type TranslationKeys = keyof typeof ru;
