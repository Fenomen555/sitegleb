import { useEffect, useState } from 'react'

function normalize(path) {
  if (!path || path === '/') {
    return '/'
  }
  return path.endsWith('/') ? path.slice(0, -1) : path
}

export function useRouter() {
  const [path, setPath] = useState(() => normalize(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setPath(normalize(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function navigate(nextPath) {
    const resolved = normalize(nextPath)
    if (resolved === path) {
      return
    }
    window.history.pushState({}, '', resolved)
    setPath(resolved)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return { path, navigate }
}
