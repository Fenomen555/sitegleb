import { useEffect, useMemo, useState } from 'react'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { newsItems } from './data/newsData'
import { useRouter } from './hooks/useRouter'
import { useScrollReveal } from './hooks/useScrollReveal'
import { defaultLanguage, translations } from './i18n/translations'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { InstructionPage } from './pages/InstructionPage'
import { LoginPage } from './pages/LoginPage'
import { NewsArticlePage } from './pages/NewsArticlePage'
import { NewsListPage } from './pages/NewsListPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RecoveryPage } from './pages/RecoveryPage'
import { RegisterPage } from './pages/RegisterPage'

function normalizePath(path) {
  if (!path || path === '/') {
    return '/'
  }
  return path.endsWith('/') ? path.slice(0, -1) : path
}

function resolveRoute(path) {
  const cleanPath = normalizePath(path)
  if (cleanPath === '/') {
    return { page: 'home' }
  }
  if (cleanPath === '/about') {
    return { page: 'about' }
  }
  if (cleanPath === '/instruction') {
    return { page: 'instruction' }
  }
  if (cleanPath === '/news') {
    return { page: 'news-list' }
  }
  if (cleanPath.startsWith('/news/')) {
    const slug = decodeURIComponent(cleanPath.replace('/news/', '').trim())
    return { page: 'news-article', slug }
  }
  if (cleanPath === '/login') {
    return { page: 'login' }
  }
  if (cleanPath === '/register') {
    return { page: 'register' }
  }
  if (cleanPath === '/recovery') {
    return { page: 'recovery' }
  }
  return { page: 'not-found' }
}

function buildPageContent(route, props) {
  if (route.page === 'home') {
    return <HomePage {...props} />
  }
  if (route.page === 'about') {
    return <AboutPage {...props} />
  }
  if (route.page === 'instruction') {
    return <InstructionPage {...props} />
  }
  if (route.page === 'news-list') {
    return <NewsListPage {...props} />
  }
  if (route.page === 'news-article') {
    return <NewsArticlePage {...props} slug={route.slug} />
  }
  if (route.page === 'login') {
    return <LoginPage {...props} />
  }
  if (route.page === 'register') {
    return <RegisterPage {...props} />
  }
  if (route.page === 'recovery') {
    return <RecoveryPage {...props} />
  }
  return <NotFoundPage {...props} />
}

function App() {
  const { path, navigate } = useRouter()
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('vision-lang')
    return saved === 'ru' || saved === 'en' ? saved : defaultLanguage
  })

  const route = useMemo(() => resolveRoute(path), [path])
  const t = translations[language] ?? translations[defaultLanguage]
  const authLikePage = route.page === 'login' || route.page === 'register' || route.page === 'recovery'

  useScrollReveal(path, language)

  useEffect(() => {
    localStorage.setItem('vision-lang', language)
  }, [language])

  useEffect(() => {
    document.title = t.meta.title
  }, [t.meta.title])

  const pageProps = {
    t,
    language,
    onNavigate: navigate,
    newsItems,
  }

  return (
    <div className={`app-shell route-${route.page}`}>
      <SiteHeader
        t={t}
        currentPath={path}
        onNavigate={navigate}
        language={language}
        onLanguageChange={setLanguage}
        compact={authLikePage}
      />
      <main className={`page-slot route-${route.page}`}>{buildPageContent(route, pageProps)}</main>
      <SiteFooter t={t} onNavigate={navigate} compact={authLikePage} />
    </div>
  )
}

export default App
