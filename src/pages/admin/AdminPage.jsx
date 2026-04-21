import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createAdmin,
  createNewsItem,
  deleteNewsItem,
  fetchAdminNews,
  fetchAdmins,
  fetchMailTemplates,
  getAdminMe,
  loginAdmin,
  logoutAdmin,
  updateAdmin,
  updateMailTemplate,
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

const emptyMailForm = {
  kind: 'registration',
  isEnabled: true,
  subject: '',
  htmlBody: '',
  textBody: '',
}

const mailTabs = [
  {
    kind: 'registration',
    title: 'Регистрация',
    description: 'Письмо, которое уходит после заявки на регистрацию.',
    variables: ['{{email}}', '{{promo}}', '{{site_url}}'],
  },
  {
    kind: 'recovery',
    title: 'Восстановление пароля',
    description: 'Письмо для формы восстановления доступа.',
    variables: ['{{email}}', '{{site_url}}'],
  },
]

const adminMenuItems = [
  {
    key: 'mail',
    badge: '01',
    label: 'Почта',
    hint: 'Шаблоны, отправка, предпросмотр',
    description: 'Письма регистрации и восстановления пароля',
  },
  {
    key: 'news-create',
    badge: '02',
    label: 'Новая новость',
    hint: 'Создание и редактирование',
    description: 'Быстрая публикация RU/EN материалов',
  },
  {
    key: 'news-list',
    badge: '03',
    label: 'Лента',
    hint: 'Все новости сайта',
    description: 'Управление опубликованными материалами',
  },
  {
    key: 'admins',
    badge: '04',
    label: 'Доступы',
    hint: 'Администраторы',
    description: 'Права входа и активность аккаунтов',
  },
]

const previewVariables = {
  email: 'client@example.com',
  promo: 'VISION2026',
  site_url: 'https://visionoftrading.com',
}

const brandLogoUrl = '/mail-avatar-email.png'

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

function renderPreviewTemplate(html) {
  return Object.entries(previewVariables).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    html || '',
  )
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function MailEditor({ value, onChange, onInsertVariable }) {
  const editorRef = useRef(null)
  const [sourceMode, setSourceMode] = useState(false)

  useEffect(() => {
    if (sourceMode) {
      return
    }
    if (editorRef.current && document.activeElement !== editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [sourceMode, value])

  function syncFromCanvas() {
    onChange(editorRef.current?.innerHTML || '')
  }

  function runCommand(command, commandValue = null) {
    if (sourceMode) {
      return
    }
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    syncFromCanvas()
  }

  function insertHtml(html) {
    runCommand('insertHTML', html)
  }

  function insertLink() {
    const url = window.prompt('Вставьте ссылку', 'https://visionoftrading.com')
    if (!url) {
      return
    }
    runCommand('createLink', url)
  }

  function insertImage() {
    const url = window.prompt('Ссылка на изображение', 'https://visionoftrading.com/mail-avatar-email.png')
    if (!url) {
      return
    }
    insertHtml(
      `<img src="${escapeHtml(url)}" alt="" style="max-width:100%;border-radius:18px;display:block;margin:16px 0;" />`,
    )
  }

  function insertButton() {
    const url = window.prompt('Ссылка для кнопки', 'https://visionoftrading.com')
    if (!url) {
      return
    }
    const label = window.prompt('Текст кнопки', 'Открыть сайт') || 'Открыть сайт'
    insertHtml(
      `<p><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#1f82ff;color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(label)}</a></p>`,
    )
  }

  function insertTable() {
    const rows = Number(window.prompt('Сколько строк?', '2') || 2)
    const columns = Number(window.prompt('Сколько колонок?', '2') || 2)
    if (!rows || !columns || rows < 1 || columns < 1) {
      return
    }

    const cells = Array.from({ length: columns }, () => '<td style="padding:10px;border:1px solid #d7e6f3;">Текст</td>').join('')
    const tableRows = Array.from({ length: rows }, () => `<tr>${cells}</tr>`).join('')
    insertHtml(`<table style="width:100%;border-collapse:collapse;margin:16px 0;">${tableRows}</table>`)
  }

  function insertVariable(variable) {
    if (sourceMode) {
      onChange(`${value || ''}${variable}`)
      onInsertVariable?.(variable)
      return
    }
    runCommand('insertText', variable)
    onInsertVariable?.(variable)
  }

  function toggleSourceMode() {
    if (sourceMode && editorRef.current) {
      editorRef.current.innerHTML = value || ''
    }
    setSourceMode((current) => !current)
  }

  const variables = mailTabs
    .flatMap((tab) => tab.variables)
    .filter((variable, index, list) => list.indexOf(variable) === index)

  return (
    <div className="mail-editor">
      <div className="mail-editor-toolbar" aria-label="Панель редактора письма">
        <div className="mail-toolbar-group">
          <button type="button" className={sourceMode ? 'active' : ''} onClick={toggleSourceMode}>
            Источник
          </button>
          <button type="button" onClick={() => runCommand('undo')}>
            Назад
          </button>
          <button type="button" onClick={() => runCommand('redo')}>
            Вперед
          </button>
        </div>

        <div className="mail-toolbar-group">
          <select defaultValue="" onChange={(event) => runCommand('formatBlock', event.target.value)}>
            <option value="" disabled>
              Формат
            </option>
            <option value="p">Абзац</option>
            <option value="h1">Заголовок H1</option>
            <option value="h2">Заголовок H2</option>
            <option value="h3">Заголовок H3</option>
            <option value="blockquote">Цитата</option>
          </select>
          <select defaultValue="" onChange={(event) => runCommand('fontName', event.target.value)}>
            <option value="" disabled>
              Шрифт
            </option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Trebuchet MS">Trebuchet</option>
            <option value="Verdana">Verdana</option>
          </select>
          <select defaultValue="" onChange={(event) => runCommand('fontSize', event.target.value)}>
            <option value="" disabled>
              Размер
            </option>
            <option value="2">Малый</option>
            <option value="3">Обычный</option>
            <option value="4">Крупный</option>
            <option value="5">Большой</option>
          </select>
        </div>

        <div className="mail-toolbar-group">
          <button type="button" onClick={() => runCommand('bold')}>
            B
          </button>
          <button type="button" onClick={() => runCommand('italic')}>
            I
          </button>
          <button type="button" onClick={() => runCommand('underline')}>
            U
          </button>
          <button type="button" onClick={() => runCommand('strikeThrough')}>
            S
          </button>
          <button type="button" onClick={() => runCommand('subscript')}>
            x₂
          </button>
          <button type="button" onClick={() => runCommand('superscript')}>
            x²
          </button>
        </div>

        <div className="mail-toolbar-group">
          <button type="button" onClick={() => runCommand('insertUnorderedList')}>
            Список
          </button>
          <button type="button" onClick={() => runCommand('insertOrderedList')}>
            1.2.
          </button>
          <button type="button" onClick={() => runCommand('outdent')}>
            ←
          </button>
          <button type="button" onClick={() => runCommand('indent')}>
            →
          </button>
          <button type="button" onClick={() => runCommand('justifyLeft')}>
            Слева
          </button>
          <button type="button" onClick={() => runCommand('justifyCenter')}>
            Центр
          </button>
          <button type="button" onClick={() => runCommand('justifyRight')}>
            Справа
          </button>
        </div>

        <div className="mail-toolbar-group">
          <button type="button" onClick={insertLink}>
            Ссылка
          </button>
          <button type="button" onClick={insertButton}>
            Кнопка
          </button>
          <button type="button" onClick={insertImage}>
            Медиа
          </button>
          <button type="button" onClick={insertTable}>
            Таблица
          </button>
          <button type="button" onClick={() => insertHtml('<hr style="border:0;border-top:1px solid #d9e8f5;margin:20px 0;" />')}>
            Линия
          </button>
          <button type="button" onClick={() => insertHtml('Ω')}>
            Ω
          </button>
        </div>

        <div className="mail-toolbar-group color-group">
          <label>
            Цвет
            <input type="color" defaultValue="#102d4d" onChange={(event) => runCommand('foreColor', event.target.value)} />
          </label>
          <label>
            Фон
            <input type="color" defaultValue="#eef7ff" onChange={(event) => runCommand('hiliteColor', event.target.value)} />
          </label>
          <button type="button" onClick={() => runCommand('removeFormat')}>
            Очистить
          </button>
        </div>
      </div>

      {sourceMode ? (
        <textarea
          className="mail-source-canvas"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck="false"
        />
      ) : (
        <div
          ref={editorRef}
          className="mail-editor-canvas"
          contentEditable
          suppressContentEditableWarning
          onInput={syncFromCanvas}
        />
      )}

      <div className="mail-variable-row">
        <span>Переменные:</span>
        {variables.map((variable) => (
          <button key={variable} type="button" onClick={() => insertVariable(variable)}>
            {variable}
          </button>
        ))}
      </div>
    </div>
  )
}

export function AdminPage({ onNavigate }) {
  const [checkingSession, setCheckingSession] = useState(true)
  const [admin, setAdmin] = useState(null)
  const [login, setLogin] = useState('Admin')
  const [password, setPassword] = useState('')
  const [news, setNews] = useState([])
  const [admins, setAdmins] = useState([])
  const [mailTemplates, setMailTemplates] = useState([])
  const [selectedMailKind, setSelectedMailKind] = useState('registration')
  const [activeSection, setActiveSection] = useState('mail')
  const [mailForm, setMailForm] = useState(emptyMailForm)
  const [newsForm, setNewsForm] = useState(emptyNewsForm)
  const [adminForm, setAdminForm] = useState({ login: '', password: '', role: 'admin' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)

  const sortedNews = useMemo(
    () => [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [news],
  )

  const activeMenuItem = adminMenuItems.find((item) => item.key === activeSection) || adminMenuItems[0]
  const activeMailTab = mailTabs.find((tab) => tab.kind === selectedMailKind) || mailTabs[0]
  const enabledMailCount = mailTemplates.filter((item) => item.isEnabled).length
  const activeAdminsCount = admins.filter((item) => item.isActive).length

  function selectAdminSection(key) {
    setActiveSection(key)
    setIsAdminMenuOpen(false)
  }

  async function loadAdminData() {
    const [nextNews, nextAdmins, nextMailTemplates] = await Promise.all([
      fetchAdminNews(),
      fetchAdmins(),
      fetchMailTemplates(),
    ])
    setNews(nextNews)
    setAdmins(nextAdmins)
    setMailTemplates(nextMailTemplates)
  }

  useEffect(() => {
    const template = mailTemplates.find((item) => item.kind === selectedMailKind)
    if (!template) {
      return
    }
    setMailForm({
      kind: template.kind,
      isEnabled: template.isEnabled,
      subject: template.subject || '',
      htmlBody: template.htmlBody || '',
      textBody: template.textBody || '',
    })
  }, [mailTemplates, selectedMailKind])

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

  useEffect(() => {
    if (!isAdminMenuOpen) {
      return undefined
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setIsAdminMenuOpen(false)
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isAdminMenuOpen])

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
    setMailTemplates([])
    setMessage('')
    setIsAdminMenuOpen(false)
  }

  async function handleSaveMail(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    try {
      const updated = await updateMailTemplate(selectedMailKind, {
        isEnabled: mailForm.isEnabled,
        subject: mailForm.subject.trim(),
        htmlBody: mailForm.htmlBody,
        textBody: mailForm.textBody.trim(),
      })
      setMailTemplates((current) => current.map((item) => (item.kind === updated.kind ? updated : item)))
      setMessage(`Шаблон "${activeMailTab.title}" сохранен.`)
    } catch (err) {
      setError(err.message || 'Не удалось сохранить шаблон письма.')
    } finally {
      setBusy(false)
    }
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
    <div className={`admin-page admin-dashboard ${isAdminMenuOpen ? 'menu-open' : ''}`}>
      <button
        type="button"
        className={`admin-menu-backdrop ${isAdminMenuOpen ? 'open' : ''}`}
        aria-label="Закрыть меню"
        onClick={() => setIsAdminMenuOpen(false)}
      />

      <aside className="admin-sidebar" aria-label="Меню админцентра">
        <div className="admin-sidebar-top">
          <div className="admin-brand-lock">V</div>
          <div>
            <p className="admin-kicker">Vision backend</p>
            <h1>Админцентр</h1>
            <p>Вы вошли как {admin.login}</p>
          </div>
          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="Закрыть меню"
            onClick={() => setIsAdminMenuOpen(false)}
          >
            Закрыть
          </button>
        </div>

        <nav className="admin-menu" aria-label="Разделы админки">
          {adminMenuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeSection === item.key ? 'active' : ''}
              onClick={() => selectAdminSection(item.key)}
            >
              <span className="admin-menu-badge">{item.badge}</span>
              <span className="admin-menu-copy">
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-card">
          <span>Текущий раздел</span>
          <strong>{activeMenuItem.label}</strong>
          <p>{activeMenuItem.description}</p>
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

      <nav className="admin-mobile-nav" aria-label="Быстрая навигация админки">
        {adminMenuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activeSection === item.key ? 'active' : ''}
            onClick={() => selectAdminSection(item.key)}
          >
            <span>{item.badge}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <main className="admin-workspace">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-trigger"
            aria-expanded={isAdminMenuOpen}
            onClick={() => setIsAdminMenuOpen(true)}
          >
            Меню
          </button>
          <div className="admin-topbar-title">
            <p className="admin-kicker">Рабочая область</p>
            <h2>{activeMenuItem.label}</h2>
            <span>{activeMenuItem.description}</span>
          </div>
          <div className="admin-quick-stats" aria-label="Быстрая сводка">
            <span>
              <strong>{news.length}</strong>
              Новости
            </span>
            <span>
              <strong>{enabledMailCount}/{mailTemplates.length || 2}</strong>
              Письма
            </span>
            <span>
              <strong>{activeAdminsCount}</strong>
              Активные
            </span>
          </div>
        </header>

        {(message || error) && <div className={`admin-alert ${error ? 'error' : 'success'}`}>{error || message}</div>}

        {activeSection === 'mail' && (
        <section className="admin-panel mail-panel">
          <div className="admin-panel-head">
            <div>
              <p className="admin-kicker">Почта</p>
              <h2>Шаблоны писем</h2>
              <p className="admin-panel-note">
                Управляем отправкой, текстом и медиа для писем регистрации и восстановления пароля.
              </p>
            </div>
            <div className="mail-brand-card">
              <img src={brandLogoUrl} alt="Vision mail avatar" />
              <span>
                <strong>Аватар письма</strong>
                <small>Подключен как бренд-логотип в шаблонах</small>
              </span>
            </div>
          </div>

          <div className="mail-tabs">
            {mailTabs.map((tab) => (
              <button
                key={tab.kind}
                type="button"
                className={selectedMailKind === tab.kind ? 'active' : ''}
                onClick={() => setSelectedMailKind(tab.kind)}
              >
                <strong>{tab.title}</strong>
                <span>{tab.description}</span>
              </button>
            ))}
          </div>

          <form className="mail-template-form" onSubmit={handleSaveMail}>
            <div className="mail-settings-row">
              <label className="mail-toggle">
                <input
                  type="checkbox"
                  checked={mailForm.isEnabled}
                  onChange={(event) => setMailForm({ ...mailForm, isEnabled: event.target.checked })}
                />
                <span>
                  <strong>{mailForm.isEnabled ? 'Отправка включена' : 'Отправка выключена'}</strong>
                  <small>Если выключить, форма на сайте примет заявку, но письмо клиенту не уйдет.</small>
                </span>
              </label>

              <label className="mail-subject-field">
                <span>Тема письма</span>
                <input
                  value={mailForm.subject}
                  onChange={(event) => setMailForm({ ...mailForm, subject: event.target.value })}
                  placeholder="Например: Vision: регистрация получена"
                />
              </label>
            </div>

            <div className="mail-template-grid">
              <div className="mail-compose">
                <div className="mail-compose-head">
                  <div>
                    <h3>{activeMailTab.title}</h3>
                    <p>{activeMailTab.description}</p>
                  </div>
                  <div className="mail-status-pill">{mailForm.isEnabled ? 'active' : 'paused'}</div>
                </div>

                <MailEditor
                  value={mailForm.htmlBody}
                  onChange={(htmlBody) => setMailForm((current) => ({ ...current, htmlBody }))}
                />

                <label className="mail-text-fallback">
                  <span>Текстовая версия письма</span>
                  <textarea
                    rows={6}
                    value={mailForm.textBody}
                    onChange={(event) => setMailForm({ ...mailForm, textBody: event.target.value })}
                    placeholder="Можно оставить пустым: backend сформирует plain-text из HTML."
                  />
                </label>
              </div>

              <aside className="mail-preview">
                <div className="mail-preview-top">
                  <p className="admin-kicker">Предпросмотр</p>
                  <strong>{mailForm.subject || 'Без темы'}</strong>
                </div>
                <div className="mail-preview-device">
                  <div dangerouslySetInnerHTML={{ __html: renderPreviewTemplate(mailForm.htmlBody) }} />
                </div>
                <div className="mail-preview-vars">
                  {activeMailTab.variables.map((variable) => (
                    <span key={variable}>{variable}</span>
                  ))}
                </div>
              </aside>
            </div>

            <button type="submit" className="admin-primary" disabled={busy || !mailForm.subject || !mailForm.htmlBody}>
              {busy ? 'Сохраняем...' : 'Сохранить шаблон'}
            </button>
          </form>
        </section>
        )}

        {activeSection === 'news-create' && (
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
        )}

        {activeSection === 'news-list' && (
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
                  <button
                    type="button"
                    onClick={() => {
                      setNewsForm(newsToForm(item))
                      selectAdminSection('news-create')
                    }}
                  >
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
        )}

        {activeSection === 'admins' && (
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
        )}
      </main>
    </div>
  )
}
