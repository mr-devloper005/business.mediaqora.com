import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { SITE_CONFIG } from '@/lib/site-config'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Sign up', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  const signup = pagesContent.auth.signup

  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-white">
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-9rem)] items-stretch gap-px bg-white/10 py-0 lg:grid-cols-2`}>
          <div className="reveal order-2 flex flex-col justify-center bg-[var(--slot4-surface-bg)] p-7 sm:p-12 lg:order-1 lg:p-16">
            <p className="mono-label text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">Create account</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em]">{signup.formTitle}</h1>
            <EditableLocalSignupForm />
            <p className="mt-6 border-t border-white/12 pt-6 text-sm text-white/55">
              Already have an account? <Link href="/login" className="font-black text-[var(--slot4-accent)] underline-offset-4 hover:underline">{signup.loginCta}</Link>
            </p>
          </div>
          <div className="order-1 flex flex-col justify-center bg-black py-16 lg:order-2 lg:py-24">
            <p className="mono-label text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">→ {signup.badge}</p>
            <h2 className="mt-8 max-w-xl text-6xl font-black uppercase leading-[0.86] tracking-[-0.05em] sm:text-8xl">{signup.title}</h2>
            <p className="mt-8 max-w-md text-base leading-8 text-white/55">{signup.description}</p>
            <p className="mono-label mt-12 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{SITE_CONFIG.name} · Wire access</p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
