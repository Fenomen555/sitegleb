import './NewsListPage.css'

function formatDate(language, value) {
  return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

export function NewsListPage({ t, language, newsItems, onNavigate }) {
  return (
    <div className="news-list-page container">
      <section className="news-list-hero" data-reveal>
        <h1 className="section-title">{t.news.title}</h1>
        <p className="section-subtitle">{t.news.subtitle}</p>
      </section>

      <section className="news-list-grid" aria-label={t.news.latest}>
        {newsItems.map((item, index) => {
          const localized = item[language] ?? item.ru
          return (
            <article key={item.slug} className="news-card" data-reveal data-reveal-delay={`${90 * (index + 1)}`}>
              <span className="news-tag">{t.news.categories[item.category] ?? item.category}</span>
              <h2>{localized.title}</h2>
              <p>{localized.excerpt}</p>
              <div className="news-meta">
                <time>{formatDate(language, item.date)}</time>
                <button type="button" onClick={() => onNavigate(`/news/${item.slug}`)}>
                  {t.common.readArticle}
                </button>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
