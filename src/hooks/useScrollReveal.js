import { useEffect } from 'react'

function toDelay(value) {
  if (!value) {
    return '0ms'
  }
  if (value.endsWith('ms') || value.endsWith('s')) {
    return value
  }
  return `${value}ms`
}

export function useScrollReveal(path, language) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'))
    if (!elements.length) {
      return undefined
    }

    elements.forEach((element) => {
      element.classList.remove('is-visible')
      element.style.setProperty('--reveal-delay', toDelay(element.dataset.revealDelay))
    })

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    const firstViewport = window.innerHeight * 0.92
    const pendingElements = elements.filter((element) => {
      const { top } = element.getBoundingClientRect()
      if (top <= firstViewport) {
        element.classList.add('is-visible')
        return false
      }
      return true
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        rootMargin: '0px 0px -6% 0px',
        threshold: 0.1,
      },
    )

    pendingElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [path, language])
}
