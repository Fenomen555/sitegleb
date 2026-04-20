import './RegisterPage.css'

export function RegisterPage({ t, onNavigate }) {
  const register = t.auth.register

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <div className="register-page container">
      <div className="register-shell" data-reveal="scale">
        <h1>{register.title}</h1>
        <p className="auth-subtitle">{register.subtitle}</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <label>
            {register.email}
            <input type="email" placeholder="name@email.com" required />
          </label>

          <label>
            {register.password}
            <input type="password" placeholder="••••••••" required />
          </label>

          <label>
            {register.promo}
            <input type="text" />
          </label>

          <label className="register-agree">
            <input type="checkbox" required />
            <span>{register.agree}</span>
          </label>

          <button type="submit" className="register-submit">
            {register.submit}
          </button>
        </form>

        <button type="button" className="register-switch" onClick={() => onNavigate('/login')}>
          {register.toLogin}
        </button>
      </div>
    </div>
  )
}

