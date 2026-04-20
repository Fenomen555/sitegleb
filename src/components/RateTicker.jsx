import { useEffect, useState } from 'react'
import './RateTicker.css'

const initialRates = [
  { symbol: 'EUR/USD', value: 1.0842, precision: 4 },
  { symbol: 'GBP/USD', value: 1.2734, precision: 4 },
  { symbol: 'USD/JPY', value: 149.52, precision: 2 },
  { symbol: 'BTC/USD', value: 68320.0, precision: 2 },
  { symbol: 'XAU/USD', value: 2186.45, precision: 2 },
]

function randomStep(symbol) {
  if (symbol === 'BTC/USD') {
    return Number((Math.random() * 48 + 6).toFixed(2))
  }
  if (symbol === 'USD/JPY') {
    return Number((Math.random() * 0.2 + 0.03).toFixed(3))
  }
  if (symbol === 'XAU/USD') {
    return Number((Math.random() * 2 + 0.25).toFixed(2))
  }
  return Number((Math.random() * 0.004 + 0.0004).toFixed(4))
}

function formatValue(language, value, precision) {
  return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value)
}

export function RateTicker({ t, language }) {
  const [rates, setRates] = useState(() =>
    initialRates.map((item) => ({
      ...item,
      change: 0,
      trend: 'flat',
      tick: 0,
    })),
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRates((current) =>
        current.map((item) => {
          const amplitude = randomStep(item.symbol)
          const direction = Math.random() > 0.46 ? 1 : -1
          const rawNext = item.value + amplitude * direction
          const nextValue = Number(Math.max(rawNext, 0.0001).toFixed(item.precision))
          return {
            ...item,
            value: nextValue,
            change: Number((nextValue - item.value).toFixed(item.precision)),
            trend: nextValue > item.value ? 'up' : 'down',
            tick: item.tick + 1,
          }
        }),
      )
    }, 1300)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <section className="rate-ticker" aria-label={t.home.ticker.title}>
      <div className="ticker-head">
        <h3>{t.home.ticker.title}</h3>
        <p>{t.home.ticker.subtitle}</p>
      </div>

      <div className="ticker-grid">
        {rates.map((item) => (
          <article key={item.symbol} className={`rate-card ${item.trend}`}>
            <p className="pair">{item.symbol}</p>
            <p className="price">{formatValue(language, item.value, item.precision)}</p>
            <p key={`${item.symbol}-${item.tick}`} className={`delta ${item.trend}`}>
              {item.change > 0 ? '+' : ''}
              {formatValue(language, item.change, item.precision)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
