import './RecoveryPage.css'

export function RecoveryPage({ t, onNavigate }) {
  const recovery = t.auth.recovery

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <div className="recovery-page container">
      <div className="recovery-shell" data-reveal="scale">
        <h1>{recovery.title}</h1>
        <p className="auth-subtitle">{recovery.subtitle}</p>

        <form className="recovery-form" onSubmit={handleSubmit}>
          <label>
            {recovery.email}
            <input type="email" placeholder="name@email.com" required />
          </label>

          <button type="submit" className="recovery-submit">
            {recovery.submit}
          </button>
        </form>

        <button type="button" className="recovery-switch" onClick={() => onNavigate('/login')}>
          {recovery.toLogin}
        </button>
      </div>
    </div>
  )
}
