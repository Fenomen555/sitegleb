import { useMemo, useRef, useState } from 'react'
import { RateTicker } from '../components/RateTicker'
import './HomePage.css'

const pairOptions = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'BTC/USD']

const pairMeta = {
  'EUR/USD': { base: 1.0842, precision: 4, spread: 0.0016 },
  'GBP/USD': { base: 1.2734, precision: 4, spread: 0.0019 },
  'USD/JPY': { base: 149.52, precision: 2, spread: 0.32 },
  'XAU/USD': { base: 2186.45, precision: 2, spread: 3.6 },
  'BTC/USD': { base: 68320.0, precision: 2, spread: 220.0 },
}

const strategyModel = {
  trend: {
    upChance: 0.58,
    confidenceBase: 73,
    expiry: ['3-5m', '5-10m', '10-15m'],
    reasonsRu: [
      'Цена держится выше внутридневной опорной зоны.',
      'Импульс подтвержден серией направленных свечей.',
      'Риск/прибыль остается в рабочем диапазоне для входа по плану.',
    ],
    reasonsEn: [
      'Price is holding above the intraday support zone.',
      'Momentum is confirmed by a sequence of directional candles.',
      'Risk/reward stays in the valid range for a plan-based entry.',
    ],
  },
  breakout: {
    upChance: 0.52,
    confidenceBase: 70,
    expiry: ['1-3m', '3-5m', '5-8m'],
    reasonsRu: [
      'Зона сопротивления или поддержки была протестирована несколько раз.',
      'Объемная активность выросла в момент выхода из диапазона.',
      'После пробоя сохраняется потенциал краткосрочного продолжения.',
    ],
    reasonsEn: [
      'Support or resistance area has been tested multiple times.',
      'Volume activity increased at the moment of range break.',
      'Post-breakout structure still supports short continuation.',
    ],
  },
  reversal: {
    upChance: 0.47,
    confidenceBase: 68,
    expiry: ['5-8m', '8-12m', '12-15m'],
    reasonsRu: [
      'В зоне экстремума появился паттерн замедления движения.',
      'Дивергенция по импульсу указывает на ослабление текущего тренда.',
      'Сигнал допускается только с уменьшенным риском и четким стоп-сценарием.',
    ],
    reasonsEn: [
      'A slowdown pattern formed near a local extreme.',
      'Momentum divergence suggests current trend exhaustion.',
      'This setup is valid only with reduced risk and strict stop scenario.',
    ],
  },
}

function formatPrice(language, value, precision) {
  return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value)
}

function formatDate(language, value) {
  return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

function formatSignalDirection(language, direction) {
  if (language === 'ru') {
    return direction === 'up' ? 'CALL / вверх' : 'PUT / вниз'
  }
  return direction === 'up' ? 'CALL / up' : 'PUT / down'
}

function buildSignal(language, pair, strategy) {
  const pairInfo = pairMeta[pair] ?? pairMeta['EUR/USD']
  const model = strategyModel[strategy] ?? strategyModel.trend
  const direction = Math.random() < model.upChance ? 'up' : 'down'

  const noise = (Math.random() - 0.5) * pairInfo.spread
  const pivot = Number((pairInfo.base + noise).toFixed(pairInfo.precision))
  const entryLow = Number((pivot - pairInfo.spread * 0.2).toFixed(pairInfo.precision))
  const entryHigh = Number((pivot + pairInfo.spread * 0.2).toFixed(pairInfo.precision))
  const confidence = Math.min(92, Math.round(model.confidenceBase + Math.random() * 11))
  const expiry = model.expiry[Math.floor(Math.random() * model.expiry.length)]

  return {
    direction,
    confidence,
    entryZone: `${formatPrice(language, entryLow, pairInfo.precision)} - ${formatPrice(language, entryHigh, pairInfo.precision)}`,
    expiry,
    reasons: language === 'ru' ? model.reasonsRu : model.reasonsEn,
  }
}

export function HomePage({ t, language, onNavigate, newsItems }) {
  const home = t.home
  const strategyOptions = home.signal?.strategies || []
  const spotlightCards = home.spotlight?.cards || []
  const spotlightChips = home.spotlight?.chips || []
  const economicItems = home.ticker.economicItems || []
  const quickSteps = t.instruction?.steps?.slice(0, 3) || []
  const carousel = home.carousel
  const carouselRef = useRef(null)

  const [selectedPair, setSelectedPair] = useState(pairOptions[0])
  const [selectedStrategy, setSelectedStrategy] = useState(strategyOptions[0]?.value ?? 'trend')
  const [signal, setSignal] = useState(null)

  const ribbonItems = useMemo(() => [...home.hero.points, ...home.hero.points], [home.hero.points])

  const quickMeta = useMemo(
    () => [
      { value: '24/5', label: language === 'ru' ? 'рынок в фокусе' : 'market in focus' },
      { value: '1.5%', label: language === 'ru' ? 'риск на сделку' : 'risk per trade' },
      { value: '1200+', label: language === 'ru' ? 'участников' : 'members' },
    ],
    [language],
  )

  const topNews = useMemo(
    () =>
      [...newsItems]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
    [newsItems],
  )

  function handleGenerateSignal(event) {
    event.preventDefault()
    setSignal(buildSignal(language, selectedPair, selectedStrategy))
  }

  function scrollNews(direction) {
    const track = carouselRef.current
    if (!track) {
      return
    }

    const firstCard = track.querySelector('.news-strip-card')
    const step = (firstCard?.clientWidth ?? 320) + 16
    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <div className="home-page">
      <section className="hero-stage">
        <div className="hero-noise" aria-hidden="true" />

        <div className="container hero-grid">
          <div className="hero-copy" data-reveal="left">
            <p className="hero-kicker">{home.hero.kicker}</p>
            <h1 className="hero-title">{home.hero.title}</h1>
            <p className="hero-subtitle">{home.hero.subtitle}</p>

            <div className="hero-actions">
              <button type="button" className="pill-button" onClick={() => onNavigate('/register')}>
                {home.hero.ctaPrimary}
              </button>
              <button type="button" className="ghost-button" onClick={() => onNavigate('/instruction')}>
                {home.hero.ctaSecondary}
              </button>
            </div>

            <ul className="hero-meta">
              {quickMeta.map((item) => (
                <li key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-live" data-reveal="right" data-reveal-delay="90">
            <RateTicker t={t} language={language} />

            <div className="macro-radar" aria-label={home.ticker.economicTitle}>
              <div className="macro-head">
                <h3>{home.ticker.economicTitle}</h3>
                <p>{home.ticker.economicSubtitle}</p>
              </div>

              <ul>
                {economicItems.map((item, index) => (
                  <li key={`${item.time}-${item.currency}-${index}`}>
                    <time>{item.time}</time>
                    <span>{item.currency}</span>
                    <p>{item.event}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="hero-ribbon" aria-hidden="true" data-reveal="up" data-reveal-delay="120">
          <div className="hero-ribbon-track">
            <div className="hero-ribbon-group">
              {ribbonItems.map((item, index) => (
                <span key={`ribbon-a-${item}-${index}`}>{item}</span>
              ))}
            </div>

            <div className="hero-ribbon-group" aria-hidden="true">
              {ribbonItems.map((item, index) => (
                <span key={`ribbon-b-${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-rhythm container">
        <div className="rhythm-head" data-reveal="up">
          <h2 className="section-title">{home.featuresTitle}</h2>
          <p className="section-subtitle">{home.spotlight.subtitle}</p>
        </div>

        <ol className="rhythm-list">
          {home.features.map((feature, index) => (
            <li
              key={feature.title}
              data-reveal={index % 2 === 0 ? 'left' : 'right'}
              data-reveal-delay={`${80 * (index + 1)}`}
            >
              <span className="rhythm-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="rhythm-content">
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-signal-lab">
        <div className="container signal-lab-shell" data-reveal="scale">
          <div className="signal-lab-head">
            <h2 className="section-title">{home.signal.title}</h2>
            <p className="section-subtitle">{home.signal.subtitle}</p>
          </div>

          <form className="signal-lab-form" onSubmit={handleGenerateSignal}>
            <label>
              <span>{home.signal.pairLabel}</span>
              <select value={selectedPair} onChange={(event) => setSelectedPair(event.target.value)}>
                {pairOptions.map((pair) => (
                  <option key={pair} value={pair}>
                    {pair}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{home.signal.strategyLabel}</span>
              <select value={selectedStrategy} onChange={(event) => setSelectedStrategy(event.target.value)}>
                {strategyOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="pill-button">
              {signal ? home.signal.refresh : home.signal.generate}
            </button>
          </form>

          <div className={`signal-output ${signal ? 'ready' : ''}`}>
            {!signal && <p className="signal-empty">{home.signal.waiting}</p>}

            {signal && (
              <>
                <div className="signal-main-row">
                  <strong>{home.signal.resultTitle}</strong>
                  <span className={`signal-direction ${signal.direction}`}>{formatSignalDirection(language, signal.direction)}</span>
                </div>

                <div className="signal-metrics">
                  <p>
                    <span>{home.signal.confidence}</span>
                    <b>{signal.confidence}%</b>
                  </p>
                  <p>
                    <span>{home.signal.entryZone}</span>
                    <b>{signal.entryZone}</b>
                  </p>
                  <p>
                    <span>{home.signal.expiry}</span>
                    <b>{signal.expiry}</b>
                  </p>
                </div>

                <div className="signal-notes">
                  <p>{home.signal.notesTitle}</p>
                  <ul>
                    {signal.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="home-briefing container">
        <div className="briefing-head" data-reveal="up">
          <h2 className="section-title">{home.spotlight.title}</h2>
          <p className="section-subtitle">{home.spotlight.subtitle}</p>
        </div>

        <div className="briefing-grid">
          {spotlightCards.map((item, index) => (
            <article key={item.label} data-reveal={index === 0 ? 'scale' : index === 1 ? 'left' : 'right'} data-reveal-delay={`${90 * (index + 1)}`}>
              <span>{item.label}</span>
              <h3>{item.value}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="briefing-chips" data-reveal="up" data-reveal-delay="120">
          {spotlightChips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </section>

      <section className="home-news-strip">
        <div className="container">
          <div className="news-strip-head" data-reveal="up">
            <div>
              <h2 className="section-title">{carousel.title}</h2>
              <p className="section-subtitle">{carousel.subtitle}</p>
            </div>

            <div className="news-strip-nav" aria-label={carousel.title}>
              <button type="button" onClick={() => scrollNews(-1)}>
                {carousel.prev}
              </button>
              <button type="button" onClick={() => scrollNews(1)}>
                {carousel.next}
              </button>
            </div>
          </div>

          <div className="news-strip-track-shell" data-reveal="up" data-reveal-delay="100">
            <div className="news-strip-track" ref={carouselRef}>
              {topNews.map((item) => {
                const localized = item[language] ?? item.ru
                return (
                  <article key={item.slug} className="news-strip-card">
                    <span className="news-strip-tag">{t.news.categories[item.category] ?? item.category}</span>
                    <h3>{localized.title}</h3>
                    <p>{localized.excerpt}</p>
                    <div className="news-strip-meta">
                      <time>{formatDate(language, item.date)}</time>
                      <button type="button" onClick={() => onNavigate(`/news/${item.slug}`)}>
                        {t.common.readArticle}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="home-journey container">
        <div className="journey-head" data-reveal="up">
          <h2 className="section-title">{t.instruction.title}</h2>
          <p className="section-subtitle">{t.instruction.subtitle}</p>
        </div>

        <div className="journey-track">
          {quickSteps.map((step, index) => (
            <article key={step.title} data-reveal={index % 2 === 0 ? 'left' : 'right'} data-reveal-delay={`${90 * (index + 1)}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta container" data-reveal="scale">
        <h2>{home.cta.title}</h2>
        <p>{home.cta.text}</p>
        <button type="button" className="pill-button" onClick={() => onNavigate('/register')}>
          {home.cta.action}
        </button>
      </section>
    </div>
  )
}
