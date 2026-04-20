export const newsItems = [
  {
    slug: 'risk-management-basics',
    date: '2026-03-15',
    category: 'education',
    ru: {
      title: 'Базовый риск-менеджмент: правило 1-2%',
      excerpt: 'Почему ограничение риска на сделку защищает депозит и помогает пережить серию убытков.',
      content: [
        'Первое, что мы внедряем в команде - лимит риска на одну сделку. Обычно это 1-2% от рабочего капитала.',
        'Такой подход позволяет сохранять контроль, даже если рынок идет не по вашему сценарию несколько сделок подряд.',
        'Перед входом в сделку фиксируйте точку отмены сценария и допустимый убыток. Дисциплина в этом вопросе важнее идеальной точки входа.',
      ],
    },
    en: {
      title: 'Risk management basics: the 1-2% rule',
      excerpt: 'How position risk limits protect your balance and keep you stable through losing streaks.',
      content: [
        'The first habit we build in the team is a strict per-trade risk cap, usually around 1-2% of your working balance.',
        'This protects your capital when the market does not follow your expected scenario for several trades in a row.',
        'Define invalidation level and max acceptable loss before entry. In real trading, discipline beats random precision.',
      ],
    },
  },
  {
    slug: 'team-daily-routine',
    date: '2026-03-12',
    category: 'team',
    ru: {
      title: 'Ежедневный ритм команды: от разбора до результата',
      excerpt: 'Как устроен типичный торговый день внутри нашей группы и почему это ускоряет прогресс.',
      content: [
        'Рабочий день начинается с короткого премаркета: отмечаем ключевые уровни, сценарии и активы в фокусе.',
        'Далее идут сессии с комментариями наставников, где участники видят не только входы, но и логику управления позицией.',
        'В конце дня проводим разбор: что сработало, где были ошибки дисциплины и как улучшить исполнение на следующей сессии.',
      ],
    },
    en: {
      title: 'Team daily routine: from review to execution',
      excerpt: 'How a typical day is structured inside our group and why this format speeds up growth.',
      content: [
        'Our day starts with a compact pre-market review: key levels, scenarios, and priority assets for the session.',
        'During live sessions, mentors explain not only entries but also position management decisions in real time.',
        'At the end of day we review outcomes: what worked, where discipline slipped, and how to improve next session.',
      ],
    },
  },
  {
    slug: 'entry-checklist-update',
    date: '2026-03-08',
    category: 'strategy',
    ru: {
      title: 'Обновление чек-листа входа: меньше импульсивных сделок',
      excerpt: 'Мы добавили новый фильтр волатильности и подтвердили снижение числа эмоциональных входов.',
      content: [
        'В новой версии чек-листа перед входом обязательно подтверждаем волатильность и текущую структуру свечей.',
        'Если рынок дергается без четкой структуры, сделка переносится. Пропуск слабого сигнала - это тоже результат.',
        'На тестовом периоде обновленный чек-лист показал более стабильную статистику по качеству входов.',
      ],
    },
    en: {
      title: 'Entry checklist update: fewer impulsive trades',
      excerpt: 'We introduced a volatility filter and confirmed a drop in emotional entries.',
      content: [
        'In the updated checklist, volatility and current candle structure must be confirmed before entry.',
        'If the market is too noisy and structure is unclear, we skip the setup. Skipping weak setups is a win.',
        'During test weeks, the updated checklist improved consistency and overall entry quality.',
      ],
    },
  },
]
