import { useEffect, useMemo, useState } from 'react'
import {
  createAdmin,
  createNewsItem,
  deleteNewsItem,
  fetchAdminNews,
  fetchAdmins,
  getAdminMe,
  loginAdmin,
  logoutAdmin,
  updateAdmin,
  updateNewsItem,
} from '../../api/client'
import './AdminPage.css'

const emptyNewsForm = {
  id: null,
  slug: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'team',
  isPublished: true,
  ruTitle: '',
  ruExcerpt: '',
  ruContent: '',
  enTitle: '',
  enExcerpt: '',
  enContent: '',
}

function newsToForm(item) {
  return {
    id: item.id,
    slug: item.slug,
    date: item.date,
    category: item.category,
    isPublished: item.isPublished,
    ruTitle: item.ru?.title || '',
    ruExcerpt: item.ru?.excerpt || '',
    ruContent: (item.ru?.content || []).join('\n'),
    enTitle: item.en?.title || '',
    enExcerpt: item.en?.excerpt || '',
    enContent: (item.en?.content || []).join('\n'),
  }
}

function formToNews(form) {
  const splitContent = (value) =>
    value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

  return {
    slug: form.slug.trim(),
    date: form.date,
    category: form.category.trim() || 'team',
    isPublished: form.isPublished,
    ru: {
      title: form.ruTitle.trim(),
      excerpt: form.ruExcerpt.trim(),
      content: splitContent(form.ruContent),
    },
    en: {
      title: form.enTitle.trim(),
      excerpt: form.enExcerpt.trim(),
      content: splitContent(form.enContent),
    },
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function AdminPage({ onNavigate }) {
  const [checkingSession, setCheckingSession] = useState(true)
  const [admin, setAdmin] = useState(null)
  const [login, setLogin] = useState('Admin')
  const [password, setPassword] = useState('')
  const [news, setNews] = useState([])
  const [admins, setAdmins] = useState([])
  const [newsForm, setNewsForm] = useState(emptyNewsForm)
  const [adminForm, setAdminForm] = useState({ login: '', password: '', role: 'admin' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const sortedNews = useMemo(
    () => [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [news],
  )

  async function loadAdminData() {
    const [nextNews, nextAdmins] = await Promise.all([fetchAdminNews(), fetchAdmins()])
    setNews(nextNews)
    setAdmins(nextAdmins)
  }

  useEffect(() => {
    let mounted = true

    getAdminMe()
      .then(async ({ admin: currentAdmin }) => {
        if (!mounted) {
          return
        }
        setAdmin(currentAdmin)
        await loadAdminData()
      })
      .catch(() => {
        if (mounted) {
          setAdmin(null)
        }
      })
      .finally(() => {
        if (mounted) {
          setCheckingSession(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  async function handleLogin(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      const result = await loginAdmin(login, password)
      setAdmin(result.admin)
      setPassword('')
      await loadAdminData()
      setMessage('Вход выполнен. Добро пожаловать в админцентр.')
    } catch (err) {
      setError('Не удалось войти. Проверь логин и пароль.')
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    await logoutAdmin()
    setAdmin(null)
    setNews([])
    setAdmins([])
    setMessage('')
  }

  async function handleSaveNews(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      const payload = formToNews(newsForm)
      if (newsForm.id) {
        await updateNewsItem(newsForm.id, payload)
        setMessage('Новость обновлена.')
      } else {
        await createNewsItem(payload)
        setMessage('Новость создана.')
      }
      setNewsForm(emptyNewsForm)
      setNews(await fetchAdminNews())
    } catch (err) {
      setError(err.message || 'Не удалось сохранить новость.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteNews(item) {
    if (!window.confirm(`Удалить новость "${item.ru?.title || item.slug}"?`)) {
      return
    }
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await deleteNewsItem(item.id)
      setNews(await fetchAdminNews())
      if (newsForm.id === item.id) {
        setNewsForm(emptyNewsForm)
      }
      setMessage('Новость удалена.')
    } catch (err) {
      setError(err.message || 'Не удалось удалить новость.')
    } finally {
      setBusy(false)
    }
  }

  async function handleCreateAdmin(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      await createAdmin(adminForm)
      setAdminForm({ login: '', password: '', role: 'admin' })
      setAdmins(await fetchAdmins())
      setMessage('Админ добавлен.')
    } catch (err) {
      setError(err.message || 'Не удалось добавить админа.')
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleAdmin(item) {
    setBusy(true)
    setError('')
    setMessage('')

    try {
      await updateAdmin(item.id, { isActive: !item.isActive })
      setAdmins(await fetchAdmins())
      setMessage('Статус админа обновлен.')
    } catch (err) {
      setError(err.message || 'Не удалось обновить админа.')
    } finally {
      setBusy(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Проверяем сессию...</div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="admin-page">
        <section className="admin-login-card">
          <button type="button" className="admin-back" onClick={() => onNavigate('/')}>
            На сайт
          </button>
          <p className="admin-kicker">Закрытая зона</p>
          <h1>Вход в админцентр</h1>
          <p>Введите логин и пароль администратора, чтобы управлять новостями и доступами.</p>

          <form onSubmit={handleLogin} className="admin-login-form">
            <label>
              <span>Логин</span>
              <input value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" />
            </label>
            <label>
              <span>Пароль</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error && <div className="admin-alert error">{error}</div>}
            <button type="submit" className="admin-primary" disabled={busy}>
              {busy ? 'Проверяем...' : 'Войти'}
            </button>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="admin-page admin-dashboard">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-kicker">Vision backend</p>
          <h1>Админцентр</h1>
          <p>Вы вошли как {admin.login}</p>
        </div>

        <div className="admin-sidebar-actions">
          <button type="button" onClick={() => onNavigate('/')}>
            Открыть сайт
          </button>
          <button type="button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </aside>

      <main className="admin-workspace">
        {(message || error) && <div className={`admin-alert ${error ? 'error' : 'success'}`}>{error || message}</div>}

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <p className="admin-kicker">Новости</p>
              <h2>{newsForm.id ? 'Редактирование новости' : 'Новая новость'}</h2>
            </div>
            <button type="button" onClick={() => setNewsForm(emptyNewsForm)}>
              Очистить
            </button>
          </div>

          <form className="admin-news-form" onSubmit={handleSaveNews}>
            <div className="admin-form-grid">
              <label>
                <span>Slug</span>
                <input value={newsForm.slug} onChange={(event) => setNewsForm({ ...newsForm, slug: event.target.value })} />
              </label>
              <label>
                <span>Дата</span>
                <input
                  type="date"
                  value={newsForm.date}
                  onChange={(event) => setNewsForm({ ...newsForm, date: event.target.value })}
                />
              </label>
              <label>
                <span>Категория</span>
                <input
                  value={newsForm.category}
                  onChange={(event) => setNewsForm({ ...newsForm, category: event.target.value })}
                />
              </label>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={newsForm.isPublished}
                  onChange={(event) => setNewsForm({ ...newsForm, isPublished: event.target.checked })}
                />
                <span>Опубликовано</span>
              </label>
            </div>

            <div className="admin-locale-grid">
              <fieldset>
                <legend>RU</legend>
                <input
                  placeholder="Заголовок"
                  value={newsForm.ruTitle}
                  onChange={(event) => setNewsForm({ ...newsForm, ruTitle: event.target.value })}
                />
                <textarea
                  placeholder="Краткое описание"
                  value={newsForm.ruExcerpt}
                  onChange={(event) => setNewsForm({ ...newsForm, ruExcerpt: event.target.value })}
                />
                <textarea
                  placeholder="Текст статьи: один абзац на строку"
                  rows={6}
                  value={newsForm.ruContent}
                  onChange={(event) => setNewsForm({ ...newsForm, ruContent: event.target.value })}
                />
              </fieldset>

              <fieldset>
                <legend>EN</legend>
                <input
                  placeholder="Title"
                  value={newsForm.enTitle}
                  onChange={(event) => setNewsForm({ ...newsForm, enTitle: event.target.value })}
                />
                <textarea
                  placeholder="Excerpt"
                  value={newsForm.enExcerpt}
                  onChange={(event) => setNewsForm({ ...newsForm, enExcerpt: event.target.value })}
                />
                <textarea
                  placeholder="Article text: one paragraph per line"
                  rows={6}
                  value={newsForm.enContent}
                  onChange={(event) => setNewsForm({ ...newsForm, enContent: event.target.value })}
                />
              </fieldset>
            </div>

            <button type="submit" className="admin-primary" disabled={busy}>
              {busy ? 'Сохраняем...' : newsForm.id ? 'Сохранить изменения' : 'Создать новость'}
            </button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <p className="admin-kicker">Лента</p>
              <h2>Все новости</h2>
            </div>
          </div>

          <div className="admin-news-list">
            {sortedNews.map((item) => (
              <article key={item.id}>
                <div>
                  <span>{item.category}</span>
                  <h3>{item.ru?.title || item.slug}</h3>
                  <p>
                    {formatDate(item.date)} · {item.isPublished ? 'опубликовано' : 'скрыто'}
                  </p>
                </div>
                <div>
                  <button type="button" onClick={() => setNewsForm(newsToForm(item))}>
                    Изменить
                  </button>
                  <button type="button" className="danger" onClick={() => handleDeleteNews(item)}>
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <p className="admin-kicker">Доступы</p>
              <h2>Администраторы</h2>
            </div>
          </div>

          <form className="admin-create-admin" onSubmit={handleCreateAdmin}>
            <input
              placeholder="Логин"
              value={adminForm.login}
              onChange={(event) => setAdminForm({ ...adminForm, login: event.target.value })}
            />
            <input
              placeholder="Пароль"
              type="password"
              value={adminForm.password}
              onChange={(event) => setAdminForm({ ...adminForm, password: event.target.value })}
            />
            <input
              placeholder="Роль"
              value={adminForm.role}
              onChange={(event) => setAdminForm({ ...adminForm, role: event.target.value })}
            />
            <button type="submit" disabled={busy}>
              Добавить
            </button>
          </form>

          <div className="admin-users-list">
            {admins.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.login}</strong>
                  <span>
                    {item.role} · {item.isActive ? 'активен' : 'выключен'}
                  </span>
                </div>
                <button type="button" onClick={() => handleToggleAdmin(item)} disabled={item.id === admin.id}>
                  {item.isActive ? 'Выключить' : 'Включить'}
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
