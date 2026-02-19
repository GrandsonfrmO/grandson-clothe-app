import { useEffect, useRef } from 'react'

interface PreloadOptions {
  delay?: number
  priority?: 'high' | 'low'
}

export function useImagePreload(
  urls: string[],
  options: PreloadOptions = {}
) {
  const { delay = 0, priority = 'low' } = options
  const preloadedRef = useRef(new Set<string>())

  useEffect(() => {
    if (!urls || urls.length === 0) return

    const preloadImages = () => {
      urls.forEach(url => {
        if (!url || preloadedRef.current.has(url)) return

        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = url
        link.fetchPriority = priority

        document.head.appendChild(link)
        preloadedRef.current.add(url)
      })
    }

    if (delay > 0) {
      const timer = setTimeout(preloadImages, delay)
      return () => clearTimeout(timer)
    } else {
      preloadImages()
    }
  }, [urls, delay, priority])
}

export function useIntersectionPreload(
  ref: React.RefObject<HTMLElement>,
  urls: string[]
) {
  const preloadedRef = useRef(false)

  useEffect(() => {
    if (!ref.current || preloadedRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !preloadedRef.current) {
            preloadedRef.current = true
            useImagePreload(urls, { priority: 'high' })
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref, urls])
}
