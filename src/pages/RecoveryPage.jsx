import { useRef, useState } from 'react'
import { sendRecoveryMail } from '../api/client'
import './RecoveryPage.css'

export function RecoveryPage({ t, onNavigate }) {
  const recovery = t.auth.recovery
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

    try {
      const result = await sendRecoveryMail(email)
      setError('')
      setStatus(
        result?.sent === false
          ? 'Запрос принят. Письмо восстановления сейчас выключено администратором.'
          : 'Письмо восстановления отправлено. Проверьте почту.',
      )
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
    <div className="recovery-page container">
      <div className="recovery-shell" data-reveal="scale">
        <h1>{recovery.title}</h1>
        <p className="auth-subtitle">{recovery.subtitle}</p>

        <form className="recovery-form" onSubmit={handleSubmit}>
          <label>
            {recovery.email}
            <input name="email" type="email" placeholder="name@email.com" required />
          </label>

          {status && <p className="auth-message success">{status}</p>}
          {error && <p className="auth-message error">{error}</p>}

          <button type="submit" className="recovery-submit" disabled={busy}>
            {busy ? 'Отправляем...' : recovery.submit}
          </button>
        </form>

        <button type="button" className="recovery-switch" onClick={() => onNavigate('/login')}>
          {recovery.toLogin}
        </button>
      </div>
    </div>
  )
}
