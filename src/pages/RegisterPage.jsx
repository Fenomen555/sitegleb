import { useRef, useState } from 'react'
import { sendRegistrationMail } from '../api/client'
import './RegisterPage.css'

export function RegisterPage({ t, onNavigate }) {
  const register = t.auth.register
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submittingRef = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (submittingRef.current) {
      return
    }
    submittingRef.current = true
    setStatus('')
    setError('')
    setBusy(true)

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim()
    const promo = String(form.get('promo') || '').trim()

    try {
      await sendRegistrationMail(email, promo || null)
      setError('')
      setStatus('Письмо по регистрации отправлено. Проверьте почту.')
      event.currentTarget.reset()
    } catch (err) {
      setStatus('')
      setError('Не удалось отправить письмо. Попробуйте еще раз чуть позже.')
    } finally {
      submittingRef.current = false
      setBusy(false)
    }
  }

  return (
    <div className="register-page container">
      <div className="register-shell" data-reveal="scale">
        <h1>{register.title}</h1>
        <p className="auth-subtitle">{register.subtitle}</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <label>
            {register.email}
            <input name="email" type="email" placeholder="name@email.com" required />
          </label>

          <label>
            {register.password}
            <input name="password" type="password" placeholder="••••••••" required />
          </label>

          <label>
            {register.promo}
            <input name="promo" type="text" />
          </label>

          <label className="register-agree">
            <input type="checkbox" required />
            <span>{register.agree}</span>
          </label>

          {status && <p className="auth-message success">{status}</p>}
          {error && <p className="auth-message error">{error}</p>}

          <button type="submit" className="register-submit" disabled={busy}>
            {busy ? 'Отправляем...' : register.submit}
          </button>
        </form>

        <button type="button" className="register-switch" onClick={() => onNavigate('/login')}>
          {register.toLogin}
        </button>
      </div>
    </div>
  )
}
