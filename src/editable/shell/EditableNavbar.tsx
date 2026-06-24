'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, LogOut, Menu, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { mediaDistributionRoute } from '@/config/media-distribution-route'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Updates', href: mediaDistributionRoute },
  { label: 'Archive', href: '/search' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { session, logout } = useEditableLocalAuthSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const firstName = session?.name?.split(' ')[0] || session?.email?.split('@')[0] || 'Member'

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl transition-all duration-300 ${
        scrolled ? 'py-1' : 'py-3'
      }`}
    >
      <div className="mx-auto flex max-w-[var(--editable-container)] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-baseline gap-1">
          <span className="text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">{SITE_CONFIG.name}</span>
          <span className="text-sm font-black text-[var(--slot4-accent)]">®</span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="link-underline mono-label text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/create"
                className="mono-label flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:border-white/50"
              >
                {firstName}
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                className="mono-label inline-flex items-center gap-1.5 rounded-full bg-[var(--slot4-accent)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/login"
                className="link-underline mono-label text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="mono-label inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[var(--slot4-accent)] hover:text-white"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/50 lg:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 px-5 py-6 lg:hidden">
          <div className="grid gap-1">
            {navLinks.map((item) => (
              <Link
                key={`m-${item.href}`}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-white/10 py-3 text-lg font-black uppercase tracking-[-0.02em] text-white"
              >
                {item.label}
                <ArrowUpRight className="h-5 w-5 text-[var(--slot4-accent)]" />
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {session ? (
              <>
                <Link href="/create" onClick={() => setOpen(false)} className="mono-label rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                  {firstName} · Publish
                </Link>
                <button onClick={() => { logout(); setOpen(false) }} className="mono-label rounded-full bg-[var(--slot4-accent)] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="mono-label rounded-full border border-white/25 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="mono-label rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
