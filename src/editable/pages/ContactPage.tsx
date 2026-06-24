'use client'

import { FileText, Mail, Megaphone, MapPin, Phone } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const desks = [
  { icon: Megaphone, title: 'Distribution desk', body: 'Submit press releases, announcements, and updates for the wire.' },
  { icon: FileText, title: 'Newsroom desk', body: 'Send story leads, corrections, source material, and coverage questions.' },
  { icon: Mail, title: 'Partnerships', body: 'Discuss syndication, media collaborations, and distribution campaigns.' },
]

export default function ContactPage() {
  const email = `hello@${SITE_CONFIG.domain}`

  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-white">
        <section className="border-b border-white/10">
          <div className={`${dc.shell.section} pb-14 pt-16 lg:pb-20 lg:pt-24`}>
            <p className="mono-label text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">→ {pagesContent.contact.eyebrow}</p>
            <h1 className="mt-8 max-w-5xl text-6xl font-black uppercase leading-[0.86] tracking-[-0.05em] sm:text-8xl">{pagesContent.contact.title}</h1>
            <p className="mt-8 max-w-2xl border-l-2 border-[var(--slot4-accent)] pl-6 text-base leading-8 text-white/65">{pagesContent.contact.description}</p>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className={`${dc.shell.section} ${dc.shell.sectionY} grid gap-12 lg:grid-cols-[0.8fr_1.2fr]`}>
            <aside className="grid gap-px self-start bg-white/10">
              {desks.map((desk, index) => (
                <div key={desk.title} className="reveal bg-black p-7">
                  <div className="flex items-center justify-between">
                    <desk.icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                    <span className="mono-label text-[11px] text-white/30">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h2 className="mt-5 text-2xl font-black uppercase tracking-[-0.03em]">{desk.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/50">{desk.body}</p>
                </div>
              ))}
              <div className="reveal bg-black p-7">
                
              </div>
            </aside>

            <div className="reveal border border-white/12 bg-[var(--slot4-surface-bg)] p-6 sm:p-10">
              <p className="mono-label text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">Send a message</p>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em]">{pagesContent.contact.formTitle}</h2>
              <EditableContactLeadForm />
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
