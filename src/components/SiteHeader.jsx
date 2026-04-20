import { useEffect, useState } from 'react'
import './SiteHeader.css'

function isActive(path, currentPath) {
  if (path === '/') {
    return currentPath === '/'
  }
  return currentPath === path || currentPath.startsWith(`${path}/`)
}

export function SiteHeader({
  t,
  currentPath,
  onNavigate,
  language,
  onLanguageChange,
  compact = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [currentPath])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 1360) {
        setMenuOpen(false)
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
    document.body.style.overflow = ''
    return undefined
  }, [menuOpen])

  function handleNavigate(event, path) {
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <header className={`site-header ${compact ? 'compact' : ''}`}>
      <div className="container header-inner">
        <a href="/" className="brand" onClick={(event) => handleNavigate(event, '/')}>
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 52 32" className="brand-mark-svg" focusable="false" aria-hidden="true">
              <path className="mark-line" d="M3 24L13 17L22 20L33 11L47 6" />
              <path className="mark-arrow" d="M42 6H47V11" />
              <rect className="mark-candle green" x="8" y="14" width="4" height="12" rx="2" />
              <rect className="mark-candle red" x="18" y="10" width="4" height="12" rx="2" />
              <rect className="mark-candle green" x="28" y="13" width="4" height="10" rx="2" />
            </svg>
          </span>
          <span className="brand-copy">
            <span className="brand-text">{t.nav.brand}</span>
            <span className="brand-subtitle">{t.nav.brandSubtitle}</span>
          </span>
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-label={t.nav.menuLabel}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`menu-backdrop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

        <div className={`header-menu ${menuOpen ? 'open' : ''}`}>
          <div className="menu-panel-top">
            <span className="menu-panel-label">{t.nav.menuLabel}</span>
            <button
              type="button"
              className="menu-close"
              aria-label={t.nav.closeMenuLabel}
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <nav className="main-nav">
            {t.nav.links.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`nav-link ${isActive(item.path, currentPath) ? 'active' : ''}`}
                onClick={(event) => handleNavigate(event, item.path)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a href="/login" className="header-action ghost" onClick={(event) => handleNavigate(event, '/login')}>
              {t.nav.login}
            </a>
            <a
              href="/register"
              className="header-action primary"
              onClick={(event) => handleNavigate(event, '/register')}
            >
              {t.nav.register}
            </a>

            <div className={`lang-switch ${language === 'en' ? 'is-en' : 'is-ru'}`} role="group" aria-label={t.nav.languageLabel}>
              <span className="lang-thumb" aria-hidden="true" />
              <button
                type="button"
                className={`lang-chip ${language === 'ru' ? 'active' : ''}`}
                onClick={() => onLanguageChange('ru')}
              >
                RU
              </button>
              <button
                type="button"
                className={`lang-chip ${language === 'en' ? 'active' : ''}`}
                onClick={() => onLanguageChange('en')}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
