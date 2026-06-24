'use client'

import { useEffect } from 'react'

/**
 * Site-wide motion layer (requirement #8):
 *  - Reading progress bar pinned to the top of the viewport.
 *  - IntersectionObserver that reveals any element marked with `.reveal` as it scrolls in.
 * Pure client side, no layout impact, and respects prefers-reduced-motion via CSS.
 */
export function EditableScrollFX() {
  useEffect(() => {
    const bar = document.createElement('div')
    bar.className = 'slot4-progress'
    document.body.appendChild(bar)

    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0
      bar.style.width = `${pct}%`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let observer: IntersectionObserver | null = null

    const wire = () => {
      const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'))
      if (reduce) {
        targets.forEach((el) => el.classList.add('is-visible'))
        return
      }
      observer?.disconnect()
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer?.unobserve(entry.target)
            }
          })
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      )
      targets.forEach((el) => observer?.observe(el))
    }

    wire()
    const mo = new MutationObserver(() => wire())
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      observer?.disconnect()
      mo.disconnect()
      bar.remove()
    }
  }, [])

  return null
}
