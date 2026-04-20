import './LoginPage.css'

export function LoginPage({ t, onNavigate }) {
  const login = t.auth.login

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <div className="login-page container">
      <div className="login-shell" data-reveal="scale">
        <h1>{login.title}</h1>
        <p className="auth-subtitle">{login.subtitle}</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            {login.email}
            <input type="email" placeholder="name@email.com" required />
          </label>

          <label>
            {login.password}
            <input type="password" placeholder="••••••••" required />
          </label>

          <div className="login-options">
            <label className="checkbox-line">
              <input type="checkbox" />
              <span>{login.remember}</span>
            </label>
            <button type="button" onClick={() => onNavigate('/recovery')}>
              {login.toRecovery}
            </button>
          </div>

          <button type="submit" className="login-submit">
            {login.submit}
          </button>
        </form>

        <button type="button" className="login-switch" onClick={() => onNavigate('/register')}>
          {login.toRegister}
        </button>
      </div>
    </div>
  )
}

