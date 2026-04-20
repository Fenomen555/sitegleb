export const defaultLanguage = 'ru'

export const translations = {
  ru: {
    meta: {
      title: 'Vision Of Trading',
    },
    nav: {
      brand: 'Vision of Trading',
      brandSubtitle: 'Команда Pocket Option',
      menuLabel: 'Меню',
      closeMenuLabel: 'Закрыть меню',
      links: [
        { path: '/', label: 'Главная' },
        { path: '/about', label: 'О нас' },
        { path: '/instruction', label: 'Инструкция' },
        { path: '/news', label: 'Вики / Новости' },
      ],
      login: 'Войти',
      register: 'Регистрация',
      languageLabel: 'Язык',
    },
    common: {
      learnMore: 'Подробнее',
      backToHome: 'На главную',
      readArticle: 'Читать статью',
      save: 'Сохранить',
    },
    home: {
      hero: {
        kicker: 'Торговая команда Pocket Option',
        title: 'Вступайте в нашу команду трейдеров и развивайтесь вместе с наставниками',
        subtitle:
          'Мы объединяем практику, дисциплину и аналитику. Получайте понятные инструкции, ежедневные разборы и поддержку команды.',
        ctaPrimary: 'Присоединиться',
        ctaSecondary: 'Как это работает',
        points: [
          'Ежедневные сигналы и разборы сделок',
          'Пошаговая система входа и контроля риска',
          'Поддержка кураторов на каждом этапе',
        ],
      },
      ticker: {
        title: 'Текущие курсы',
        subtitle: 'Демо-поток (без API) с динамическим обновлением котировок',
        economicTitle: 'Экономические новости',
        economicSubtitle: 'Ближайшие события календаря (mock)',
        economicItems: [
          {
            time: '10:30',
            currency: 'EUR',
            event: 'Индекс деловой активности (PMI)',
            impact: 'high',
            impactLabel: 'Высокая',
          },
          {
            time: '15:30',
            currency: 'USD',
            event: 'Отчет по рынку труда',
            impact: 'high',
            impactLabel: 'Высокая',
          },
          {
            time: '17:00',
            currency: 'GBP',
            event: 'Выступление представителя ЦБ',
            impact: 'medium',
            impactLabel: 'Средняя',
          },
        ],
        pulseTitle: 'Рыночный пульс',
        pulseSubtitle: 'Еле заметные свечи на дальнем плане показывают движение рынка',
      },
      featuresTitle: 'Что вы получаете в команде',
      features: [
        {
          title: 'План на каждую сессию',
          text: 'У вас будет готовый торговый план на день: сценарии, тайминг и приоритетные активы.',
        },
        {
          title: 'Аналитика без шума',
          text: 'Фокусируемся на понятных сетапах и статистике, а не на хаотичных входах.',
        },
        {
          title: 'Рост через дисциплину',
          text: 'Учимся не только зарабатывать, но и защищать депозит благодаря риск-менеджменту.',
        },
      ],
      cta: {
        title: 'Готовы перейти от хаоса к системной торговле?',
        text: 'Откройте доступ к нашему обучению и начните торговать с командой уже сегодня.',
        action: 'Открыть регистрацию',
      },
      signal: {
        title: 'Получить торговый сигнал',
        subtitle:
          'Выберите валютную пару и стратегию. Мы сформируем ориентир по направлению, зоне входа и рабочей экспирации.',
        pairLabel: 'Валютная пара',
        strategyLabel: 'Стратегия',
        generate: 'Получить сигнал',
        refresh: 'Обновить сигнал',
        resultTitle: 'Сигнал готов',
        confidence: 'Уверенность',
        entryZone: 'Зона входа',
        expiry: 'Экспирация',
        notesTitle: 'Почему этот сигнал',
        waiting: 'Выберите параметры и нажмите «Получить сигнал».',
        strategies: [
          { value: 'trend', label: 'Тренд по импульсу' },
          { value: 'breakout', label: 'Пробой уровня' },
          { value: 'reversal', label: 'Локальный разворот' },
        ],
      },
      spotlight: {
        title: 'Брифинг перед сессией',
        subtitle: 'Короткий snapshot рынка, чтобы входить в сделки с контекстом, а не на эмоциях.',
        cards: [
          {
            label: 'Режим рынка',
            value: 'Умеренный тренд',
            text: 'EUR и GBP сохраняют направленность, импульсы лучше отрабатывать после откатов.',
          },
          {
            label: 'План риска',
            value: '1.5% на сделку',
            text: 'После двух подряд минусов снижаем объём и пропускаем слабые входы.',
          },
          {
            label: 'Окно фокуса',
            value: '10:30-17:00',
            text: 'Основная ликвидность и новости, где сетапы отрабатывают наиболее стабильно.',
          },
        ],
        chips: ['EUR/USD в приоритете', 'Стоп по сценарию', 'Не торгуем без чек-листа'],
      },
      carousel: {
        title: 'Лента новостей команды',
        subtitle: 'Свайпайте по карточкам и открывайте публикации прямо с главной страницы.',
        prev: 'Назад',
        next: 'Вперед',
      },
    },
    about: {
      heroTitle: 'О нашей команде',
      heroText:
        'Мы создаем среду, где трейдер может расти в стабильном темпе: от первых сделок до уверенной системной работы.',
      statsTitle: 'Почему участники выбирают нас',
      stats: [
        { value: '1200+', label: 'активных участников комьюнити' },
        { value: '78%', label: 'участников проходят полный курс адаптации' },
        { value: '6', label: 'живых разборов в неделю' },
        { value: '24/7', label: 'поддержка в закрытом чате' },
      ],
      quoteTitle: 'Как мы работаем с участниками',
      quoteText:
        'Наша цель не в разовых сделках, а в выстраивании навыков. Мы даем структуру, обратную связь и привычку действовать по плану.',
      quoteAuthor: 'Куратор команды Vision of Trading',
      valuesTitle: 'Наши ключевые принципы',
      values: [
        {
          title: 'Технологичность',
          text: 'Используем понятные инструменты анализа и рабочие чек-листы перед каждой сделкой.',
        },
        {
          title: 'Лояльность к ученику',
          text: 'Объясняем простым языком и поддерживаем персональный темп обучения.',
        },
        {
          title: 'Сообщество',
          text: 'Развиваем культуру взаимопомощи: сильные участники помогают новичкам быстрее расти.',
        },
        {
          title: 'Прозрачность',
          text: 'Каждое решение в торговле должно быть обосновано. Никаких «секретных кнопок».',
        },
        {
          title: 'Риск-контроль',
          text: 'Стабильность начинается с ограничения убытков. Этот принцип закрепляем с первого дня.',
        },
        {
          title: 'Долгосрочный рост',
          text: 'Фокус на дистанции, а не на эмоциональных рывках.',
        },
      ],
    },
    instruction: {
      title: 'Инструкция по старту',
      subtitle: 'Пошаговый путь для новых участников команды',
      steps: [
        {
          title: '1. Создайте аккаунт',
          text: 'Зарегистрируйтесь на платформе, подтвердите email и настройте безопасный пароль.',
        },
        {
          title: '2. Пройдите вводный бриф',
          text: 'Ознакомьтесь с базовой методологией, режимами рынка и правилами риск-менеджмента.',
        },
        {
          title: '3. Подключитесь к чату',
          text: 'Получите доступ к закрытому каналу сигналов, расписанию сессий и поддержке куратора.',
        },
        {
          title: '4. Торгуйте по чек-листу',
          text: 'Используйте шаблон подготовки сделки и фиксируйте результат в дневнике трейдера.',
        },
      ],
      checklistTitle: 'Что подготовить заранее',
      checklist: [
        'Стабильный интернет и рабочее место без отвлекающих факторов',
        'Минимум 90 минут на учебно-торговую сессию',
        'Готовность следовать лимитам риска и дневным ограничениям',
      ],
      faqTitle: 'Частые вопросы',
      faq: [
        {
          q: 'Нужен ли опыт в трейдинге?',
          a: 'Нет, программа рассчитана и на новичков. Главное - регулярность и дисциплина.',
        },
        {
          q: 'Сколько времени занимает адаптация?',
          a: 'Обычно 7-14 дней активной практики, чтобы уверенно работать по нашему алгоритму.',
        },
        {
          q: 'Вы даете финансовые гарантии?',
          a: 'Нет. Мы предоставляем обучение и инструменты, итог зависит от вашей дисциплины и соблюдения правил.',
        },
      ],
    },
    news: {
      title: 'Вики / Новости',
      subtitle: 'Актуальные материалы по торговле, дисциплине и обновлениям команды',
      latest: 'Свежие публикации',
      categories: {
        education: 'Обучение',
        team: 'Команда',
        strategy: 'Стратегия',
      },
      articleBack: 'К списку новостей',
      articleNotFound: 'Новость не найдена',
    },
    auth: {
      login: {
        title: 'Вход',
        subtitle: 'Войдите в кабинет участника команды',
        email: 'Email',
        password: 'Пароль',
        remember: 'Запомнить меня',
        submit: 'Войти',
        toRegister: 'Нет аккаунта? Регистрация',
        toRecovery: 'Восстановление пароля',
      },
      register: {
        title: 'Регистрация',
        subtitle: 'Создайте аккаунт и получите доступ к команде',
        email: 'Email',
        password: 'Пароль',
        promo: 'Промокод (необязательно)',
        agree: 'Я принимаю условия предоставления услуг',
        submit: 'Зарегистрироваться',
        toLogin: 'Уже зарегистрированы? Войти',
      },
      recovery: {
        title: 'Восстановление пароля',
        subtitle: 'Укажите email, и мы отправим инструкцию для восстановления доступа.',
        email: 'Email',
        submit: 'Отправить ссылку',
        toLogin: 'Вернуться ко входу',
      },
    },
    footer: {
      riskTitle: 'Предупреждение о рисках',
      riskText:
        'Торговля финансовыми инструментами связана с риском. Материалы сайта носят информационный характер и не являются индивидуальной инвестиционной рекомендацией.',
      links: [
        { path: '/about', label: 'О компании' },
        { path: '/instruction', label: 'Инструкция' },
        { path: '/news', label: 'Новости' },
      ],
      copy: 'Vision of Trading Team',
    },
    notFound: {
      title: 'Страница не найдена',
      text: 'Возможно, ссылка устарела или была изменена.',
      action: 'Вернуться на главную',
    },
  },
  en: {
    meta: {
      title: 'Vision Of Trading',
    },
    nav: {
      brand: 'Vision of Trading',
      brandSubtitle: 'Pocket Option Team',
      menuLabel: 'Menu',
      closeMenuLabel: 'Close menu',
      links: [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About us' },
        { path: '/instruction', label: 'Instruction' },
        { path: '/news', label: 'Wiki / News' },
      ],
      login: 'Sign in',
      register: 'Register',
      languageLabel: 'Language',
    },
    common: {
      learnMore: 'Learn more',
      backToHome: 'Back to home',
      readArticle: 'Read article',
      save: 'Save',
    },
    home: {
      hero: {
        kicker: 'Pocket Option trading team',
        title: 'Join our traders and grow with mentors every day',
        subtitle:
          'We combine practice, discipline, and analytics. Get clear instructions, daily market breakdowns, and team support.',
        ctaPrimary: 'Join now',
        ctaSecondary: 'How it works',
        points: [
          'Daily signals and trade reviews',
          'Step-by-step entry system with risk control',
          'Mentor support at every stage',
        ],
      },
      ticker: {
        title: 'Live quotes',
        subtitle: 'Demo stream (no API yet) with dynamic updates',
        economicTitle: 'Economic news',
        economicSubtitle: 'Upcoming calendar events (mock)',
        economicItems: [
          {
            time: '10:30',
            currency: 'EUR',
            event: 'Purchasing Managers Index (PMI)',
            impact: 'high',
            impactLabel: 'High',
          },
          {
            time: '15:30',
            currency: 'USD',
            event: 'Labor market report',
            impact: 'high',
            impactLabel: 'High',
          },
          {
            time: '17:00',
            currency: 'GBP',
            event: 'Central bank official speech',
            impact: 'medium',
            impactLabel: 'Medium',
          },
        ],
        pulseTitle: 'Market pulse',
        pulseSubtitle: 'Subtle distant candles visualize quiet market movement',
      },
      featuresTitle: 'What you get inside the team',
      features: [
        {
          title: 'Plan for every session',
          text: 'You receive a clear daily plan: scenarios, timing, and priority assets.',
        },
        {
          title: 'Signal over noise',
          text: 'We focus on clear setups and statistics instead of random emotional entries.',
        },
        {
          title: 'Growth through discipline',
          text: 'Learn not only to earn but to protect your balance with proper risk management.',
        },
      ],
      cta: {
        title: 'Ready to move from chaos to structured trading?',
        text: 'Get access to our training flow and start trading with the team today.',
        action: 'Open registration',
      },
      signal: {
        title: 'Get a trading signal',
        subtitle:
          'Select a currency pair and strategy. We will generate direction, entry zone, and suggested expiry window.',
        pairLabel: 'Currency pair',
        strategyLabel: 'Strategy',
        generate: 'Get signal',
        refresh: 'Refresh signal',
        resultTitle: 'Signal is ready',
        confidence: 'Confidence',
        entryZone: 'Entry zone',
        expiry: 'Expiry',
        notesTitle: 'Why this signal',
        waiting: 'Choose parameters and click "Get signal".',
        strategies: [
          { value: 'trend', label: 'Trend momentum' },
          { value: 'breakout', label: 'Level breakout' },
          { value: 'reversal', label: 'Local reversal' },
        ],
      },
      spotlight: {
        title: 'Pre-session briefing',
        subtitle: 'A compact market snapshot so you trade with context instead of emotion.',
        cards: [
          {
            label: 'Market mode',
            value: 'Moderate trend',
            text: 'EUR and GBP keep direction; pullback entries currently show better quality.',
          },
          {
            label: 'Risk plan',
            value: '1.5% per trade',
            text: 'After two losses in a row, reduce size and skip low-quality setups.',
          },
          {
            label: 'Focus window',
            value: '10:30-17:00',
            text: 'Core liquidity and events where setups are usually more consistent.',
          },
        ],
        chips: ['Prioritize EUR/USD', 'Stops by scenario', 'No trade without checklist'],
      },
      carousel: {
        title: 'Team news feed',
        subtitle: 'Swipe cards and open posts directly from the homepage.',
        prev: 'Previous',
        next: 'Next',
      },
    },
    about: {
      heroTitle: 'About our team',
      heroText:
        'We build an environment where a trader can grow steadily: from first deals to confident system-based execution.',
      statsTitle: 'Why traders choose us',
      stats: [
        { value: '1200+', label: 'active community members' },
        { value: '78%', label: 'students complete full adaptation program' },
        { value: '6', label: 'live review sessions per week' },
        { value: '24/7', label: 'support in private chat' },
      ],
      quoteTitle: 'How we work with members',
      quoteText:
        'Our goal is not one-time wins but repeatable skills. We provide structure, feedback, and the habit of trading by plan.',
      quoteAuthor: 'Vision of Trading Team Mentor',
      valuesTitle: 'Our key principles',
      values: [
        {
          title: 'Technology-first',
          text: 'We use clear analysis tools and practical checklists before every trade.',
        },
        {
          title: 'Member loyalty',
          text: 'We teach in plain language and support each trader at their own pace.',
        },
        {
          title: 'Community power',
          text: 'A culture of support where stronger members help newcomers grow faster.',
        },
        {
          title: 'Transparency',
          text: 'Every decision must be justified. No magic buttons or hidden tricks.',
        },
        {
          title: 'Risk control',
          text: 'Stability begins with downside limits, this is taught from day one.',
        },
        {
          title: 'Long-term growth',
          text: 'We optimize for long distance, not emotional short bursts.',
        },
      ],
    },
    instruction: {
      title: 'Getting started instruction',
      subtitle: 'A step-by-step path for new team members',
      steps: [
        {
          title: '1. Create your account',
          text: 'Register on the platform, verify your email, and set a secure password.',
        },
        {
          title: '2. Finish onboarding brief',
          text: 'Learn the core method, market modes, and risk management rules.',
        },
        {
          title: '3. Join the private chat',
          text: 'Get access to signals, session schedule, and mentor support channel.',
        },
        {
          title: '4. Trade by checklist',
          text: 'Use the setup checklist and log every result in your trader journal.',
        },
      ],
      checklistTitle: 'Prepare before your start',
      checklist: [
        'Stable internet and distraction-free workplace',
        'At least 90 minutes for a learning/trading session',
        'Readiness to follow risk limits and daily stop rules',
      ],
      faqTitle: 'FAQ',
      faq: [
        {
          q: 'Do I need previous trading experience?',
          a: 'No. The program is built for beginners as well. Consistency matters most.',
        },
        {
          q: 'How long does adaptation take?',
          a: 'Usually 7-14 days of active practice to become confident in our workflow.',
        },
        {
          q: 'Do you provide financial guarantees?',
          a: 'No. We provide education and tools; your final result depends on your discipline.',
        },
      ],
    },
    news: {
      title: 'Wiki / News',
      subtitle: 'Latest posts about trading, discipline, and team updates',
      latest: 'Latest posts',
      categories: {
        education: 'Education',
        team: 'Team',
        strategy: 'Strategy',
      },
      articleBack: 'Back to all news',
      articleNotFound: 'Article not found',
    },
    auth: {
      login: {
        title: 'Sign in',
        subtitle: 'Enter your team member dashboard',
        email: 'Email',
        password: 'Password',
        remember: 'Remember me',
        submit: 'Sign in',
        toRegister: 'No account yet? Register',
        toRecovery: 'Recover password',
      },
      register: {
        title: 'Registration',
        subtitle: 'Create an account and join the team',
        email: 'Email',
        password: 'Password',
        promo: 'Promo code (optional)',
        agree: 'I accept the service terms',
        submit: 'Create account',
        toLogin: 'Already registered? Sign in',
      },
      recovery: {
        title: 'Password recovery',
        subtitle: 'Enter your email, and we will send a recovery instruction.',
        email: 'Email',
        submit: 'Send link',
        toLogin: 'Back to sign in',
      },
    },
    footer: {
      riskTitle: 'Risk warning',
      riskText:
        'Trading financial instruments involves risks. Website materials are informational and do not represent personal investment advice.',
      links: [
        { path: '/about', label: 'About' },
        { path: '/instruction', label: 'Instruction' },
        { path: '/news', label: 'News' },
      ],
      copy: 'Vision of Trading Team',
    },
    notFound: {
      title: 'Page not found',
      text: 'The link may be outdated or moved.',
      action: 'Return home',
    },
  },
}



