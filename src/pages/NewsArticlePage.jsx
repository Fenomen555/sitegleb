import './NewsArticlePage.css'

function formatDate(language, value) {
  return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(new Date(value))
}

export function NewsArticlePage({ t, language, newsItems, slug, onNavigate }) {
  const article = newsItems.find((item) => item.slug === slug)

  if (!article) {
    return (
      <div className="news-article-page container">
        <section className="article-missing" data-reveal>
          <h1>{t.news.articleNotFound}</h1>
          <button type="button" className="pill-button" onClick={() => onNavigate('/news')}>
            {t.news.articleBack}
          </button>
        </section>
      </div>
    )
  }

  const localized = article[language] ?? article.ru

  return (
    <div className="news-article-page container">
      <button type="button" className="article-back" onClick={() => onNavigate('/news')}>
        {t.news.articleBack}
      </button>

      <article className="article-box" data-reveal>
        <span className="article-tag">{t.news.categories[article.category] ?? article.category}</span>
        <h1>{localized.title}</h1>
        <time>{formatDate(language, article.date)}</time>

        <div className="article-content">
          {localized.content.map((paragraph, index) => (
            <p key={paragraph} data-reveal data-reveal-delay={`${90 * (index + 1)}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  )
}
