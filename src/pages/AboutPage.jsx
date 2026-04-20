import './AboutPage.css'

export function AboutPage({ t }) {
  const about = t.about

  return (
    <div className="about-page">
      <section className="about-hero" data-reveal>
        <div className="container">
          <h1 className="section-title">{about.heroTitle}</h1>
          <p className="section-subtitle">{about.heroText}</p>
        </div>
      </section>

      <section className="about-stats container" data-reveal>
        <h2>{about.statsTitle}</h2>
        <div className="stats-grid">
          {about.stats.map((item, index) => (
            <article key={item.label} className="stat-card" data-reveal data-reveal-delay={`${80 * (index + 1)}`}>
              <p className="value">{item.value}</p>
              <p className="label">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-quote" data-reveal>
        <div className="container quote-grid">
          <h2>{about.quoteTitle}</h2>
          <blockquote>
            <p>{about.quoteText}</p>
            <cite>{about.quoteAuthor}</cite>
          </blockquote>
        </div>
      </section>

      <section className="about-values container">
        <h2 data-reveal>{about.valuesTitle}</h2>
        <div className="values-grid">
          {about.values.map((item, index) => (
            <article key={item.title} className="value-card" data-reveal data-reveal-delay={`${70 * (index + 1)}`}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
