import './NewsArticlePage.css'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function hasHtmlMarkup(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function buildArticleHtml(content) {
  const entries = Array.isArray(content) ? content.filter(Boolean) : []
  if (!entries.length) {
    return ''
  }
  if (entries.some(hasHtmlMarkup)) {
    return entries.join('')
  }
  return entries.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
}

function sanitizeArticleHtml(html) {
  if (typeof window === 'undefined' || !window.DOMParser) {
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  }

  const documentNode = new window.DOMParser().parseFromString(html, 'text/html')
  documentNode.querySelectorAll('script, iframe, object, embed, form, input').forEach((node) => node.remove())

  documentNode.body.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim().toLowerCase()
      if (name.startsWith('on') || value.startsWith('javascript:')) {
        node.removeAttribute(attribute.name)
      }
      if (name === 'style') {
        node.removeAttribute(attribute.name)
      }
    })

    if (node.tagName === 'A') {
      node.setAttribute('rel', 'noreferrer')
      node.setAttribute('target', '_blank')
    }
  })

  return documentNode.body.innerHTML
}

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
  const articleHtml = sanitizeArticleHtml(buildArticleHtml(localized.content))

  return (
    <div className="news-article-page container">
      <button type="button" className="article-back" onClick={() => onNavigate('/news')}>
        {t.news.articleBack}
      </button>

      <article className="article-box" data-reveal>
        <span className="article-tag">{t.news.categories[article.category] ?? article.category}</span>
        <h1>{localized.title}</h1>
        <time>{formatDate(language, article.date)}</time>

        <div className="article-content" dangerouslySetInnerHTML={{ __html: articleHtml }} />
      </article>
    </div>
  )
}
