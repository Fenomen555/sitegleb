import './NotFoundPage.css'

export function NotFoundPage({ t, onNavigate }) {
  return (
    <div className="not-found-page container">
      <section className="not-found-box" data-reveal>
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.text}</p>
        <button type="button" className="pill-button" onClick={() => onNavigate('/')}>
          {t.notFound.action}
        </button>
      </section>
    </div>
  )
}
