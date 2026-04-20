import './SiteFooter.css'

export function SiteFooter({ t, onNavigate, compact = false }) {
  function handleNavigate(event, path) {
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <footer className={`site-footer ${compact ? 'compact' : ''}`}>
      <div className="container footer-wrap">
        <div className="risk-box">
          <h3>{t.footer.riskTitle}</h3>
          <p>{t.footer.riskText}</p>
        </div>

        <div className="footer-line">
          <nav className="footer-links">
            {t.footer.links.map((link) => (
              <a key={link.path} href={link.path} onClick={(event) => handleNavigate(event, link.path)}>
                {link.label}
              </a>
            ))}
          </nav>
          <p className="footer-copy">{new Date().getFullYear()} {t.footer.copy}</p>
        </div>
      </div>
    </footer>
  )
}
