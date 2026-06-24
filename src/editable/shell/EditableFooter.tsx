'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { mediaDistributionRoute } from '@/config/media-distribution-route'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Updates', href: mediaDistributionRoute },
  { label: 'Archive', href: '/search' },
]

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()
  const email = `hello@${SITE_CONFIG.domain}`

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      {/* Big CTA band */}
      <div className="mx-auto max-w-[var(--editable-container)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="reveal">
          <h2 className="text-[13vw] font-black uppercase leading-[0.84] tracking-[-0.05em] lg:text-[9rem]">
            Story to <span className="text-[var(--slot4-accent)]">share?</span>
          </h2>
          <div className="mt-10 grid gap-8 border-t border-white/12 pt-8 lg:grid-cols-[auto_1fr_auto] lg:items-start">
            <p className="mono-label text-[11px] font-bold uppercase tracking-[0.26em] text-white/60">
              → Let&apos;s distribute
            </p>
            <p className="max-w-xl text-sm leading-7 text-white/55">
              {globalContent.footer?.description || SITE_CONFIG.description}
            </p>
            <Link
              href="/contact"
              className="mono-label inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[var(--slot4-accent)] hover:text-white"
            >
              Submit an update <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Identity + sitemap */}
      <div className="mx-auto grid max-w-[var(--editable-container)] gap-12 border-t border-white/12 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-12">
        <div>
          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-[-0.04em]">{SITE_CONFIG.name}</span>
            <span className="text-base font-black text-[var(--slot4-accent)]">®</span>
          </Link>
          <a
            href="/contact"
            className="mt-7 block max-w-xl break-words text-3xl font-black leading-[1.05] tracking-[-0.04em] text-white/90 transition hover:text-[var(--slot4-accent)] sm:text-5xl"
          >
            Let&apos;s work together!
          </a>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/45">{SITE_CONFIG.tagline}</p>
        </div>

        <nav className="lg:pl-8">
          {footerLinks.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between border-b border-white/12 py-4 text-sm font-black uppercase tracking-[0.08em] text-white/85 transition hover:text-[var(--slot4-accent)]"
            >
              <span className="flex items-center gap-3">
                <ArrowUpRight className="h-4 w-4 text-[var(--slot4-accent)]" /> {item.label}
              </span>
              <span className="mono-label text-[11px] text-white/40">{String(index + 1).padStart(2, '0')}</span>
            </Link>
          ))}
          <div className="mt-5 flex flex-wrap gap-3">
            {session ? (
              <>
                <Link href="/create" className="mono-label rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-white/50">Publish</Link>
                <button onClick={logout} className="mono-label rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-white/50">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="mono-label rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-white/50">Log in</Link>
                <Link href="/signup" className="mono-label rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-white/50">Sign up</Link>
              </>
            )}
          </div>
        </nav>
      </div>

      <div className="border-t border-white/12">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col gap-2 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p className="mono-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">© {year} {SITE_CONFIG.name}. {globalContent.footer?.bottomNote}</p>
          <p className="mono-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">©2020 — {year}</p>
        </div>
      </div>
    </footer>
  )
}
