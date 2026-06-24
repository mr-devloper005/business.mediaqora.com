import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export default function AboutPage() {
  const about = pagesContent.about

  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-white">
        {/* Hero */}
        <section className="border-b border-white/10">
          <div className={`${dc.shell.section} pb-16 pt-16 lg:pb-24 lg:pt-24`}>
            <p className="mono-label text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">→ {about.badge}</p>
            <h1 className="mt-8 max-w-6xl text-6xl font-black uppercase leading-[0.86] tracking-[-0.05em] sm:text-8xl lg:text-[9rem]">
              {about.title}
            </h1>
            <p className="mt-10 max-w-2xl border-l-2 border-[var(--slot4-accent)] pl-6 text-lg leading-8 text-white/70">{about.description}</p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-white/10">
          <div className={`${dc.shell.section}`}>
            <div className="grid gap-px bg-white/10 sm:grid-cols-3">
              {about.stats.map((stat) => (
                <div key={stat.label} className="reveal bg-black px-6 py-12 text-center">
                  <p className="text-6xl font-black tracking-[-0.05em] text-[var(--slot4-accent)] sm:text-7xl">{stat.value}</p>
                  <p className="mono-label mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story + values */}
        <section className="border-b border-white/10">
          <div className={`${dc.shell.section} ${dc.shell.sectionY} grid gap-14 lg:grid-cols-[1.1fr_0.9fr]`}>
            <div className="reveal">
              <p className="mono-label text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slot4-accent)]">About {SITE_CONFIG.name}</p>
              <div className="article-content mt-7 max-w-xl">
                {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
            <div className="grid gap-px bg-white/10">
              {about.values.map((value, index) => (
                <div key={value.title} className="reveal bg-black p-8">
                  <div className="flex items-baseline justify-between">
                    <span className="mono-label text-[11px] font-bold text-white/30">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.03em] text-white">{value.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-white/55">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-b border-white/10">
          <div className={`${dc.shell.section} ${dc.shell.sectionY} reveal flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between`}>
            <h2 className="max-w-3xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.045em] sm:text-7xl">
              Read the updates shaping the conversation.
            </h2>
            <Link href="/search" className={`${dc.button.accent} w-fit`}>Explore the wire <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
