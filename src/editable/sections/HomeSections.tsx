import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { getEditableExcerpt, getEditableCategory, postHref, RailPostCard } from '@/editable/cards/PostCards'
import { EditableClock } from '@/editable/components/EditableClock'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

/* ---------------- HERO (image 1) ---------------- */
export function EditableHomeHero(_props: HomeSectionProps) {
  const hero = pagesContent.home.hero
  const year = new Date().getFullYear()
  const titleWords = hero.title.length ? hero.title : [SITE_CONFIG.name]

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className={`${dc.shell.section} pb-14 pt-16 sm:pt-20 lg:pb-20 lg:pt-24`}>
        <p className="mono-label text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
          → {hero.badge}
        </p>

        <h1 className="mt-8 text-[16vw] font-black uppercase leading-[0.82] tracking-[-0.05em] sm:text-[14vw] lg:text-[11rem]">
          <span className="hero-line block overflow-hidden">
            <span style={{ animationDelay: '0.05s' }}>{titleWords[0]}</span>
          </span>
          {titleWords[1] ? (
            <span className="hero-line block overflow-hidden text-[var(--slot4-accent)]">
              <span style={{ animationDelay: '0.18s' }}>{titleWords[1]}</span>
            </span>
          ) : null}
        </h1>

        <div className="mt-14 grid gap-10 border-t border-white/12 pt-10 lg:grid-cols-[0.9fr_0.7fr_1.1fr_auto]">
          <div className="reveal">
            <EditableClock label={hero.location} />
          </div>

          <ul className="reveal grid gap-2">
            {hero.services.map((service) => (
              <li key={service} className="mono-label text-[12px] font-bold uppercase tracking-[0.18em] text-white/70">
                {service}
              </li>
            ))}
          </ul>

          <div className="reveal">
            <p className="max-w-md text-base leading-7 text-white/85">{hero.description}</p>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/45">{hero.note}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={hero.primaryCta.href} className={dc.button.accent}>{hero.primaryCta.label}</Link>
              <Link href={hero.secondaryCta.href} className={dc.button.secondary}>{hero.secondaryCta.label}</Link>
            </div>
          </div>

          <p className="mono-label text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">©2020 — {year}</p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- LATEST UPDATES RAIL (text cards, no images) ---------------- */
export function EditableStoryRail({ primaryTask, primaryRoute, posts }: HomeSectionProps) {
  const railPosts = (posts.slice(0, 10).length ? posts.slice(0, 10) : posts)
  if (!railPosts.length) return null
  return (
    <section className="border-b border-white/10">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mono-label text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">→ {pagesContent.home.projects.badge}</p>
            <h2 className={`${dc.type.sectionTitle} mt-4`}>Latest updates</h2>
          </div>
          <Link href={primaryRoute} className="mono-label inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 hover:text-[var(--slot4-accent)]">
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className={`${dc.layout.rail} mt-10`}>
          {railPosts.map((post, index) => (
            <RailPostCard key={post.id} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- CURATED WIRE — big editorial numbered list (image 2, text) ---------------- */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts }: HomeSectionProps) {
  const rows = posts.slice(0, 6)
  if (!rows.length) return null
  return (
    <section className="border-b border-white/10">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <div className="reveal flex items-start justify-between gap-6">
          <h2 className="text-6xl font-black uppercase leading-[0.85] tracking-[-0.05em] sm:text-8xl">
            The Wire
            <span className="ml-4 align-top text-2xl text-[var(--slot4-accent)]">[{String(rows.length).padStart(2, '0')}]</span>
          </h2>
          <p className="mono-label hidden max-w-[200px] text-right text-[11px] font-bold uppercase tracking-[0.18em] text-white/45 sm:block">
            → {pagesContent.home.projects.badge}
          </p>
        </div>

        <div className="mt-12 border-t border-white/12">
          {rows.map((post, index) => (
            <Link
              key={post.id}
              href={postHref(primaryTask, post, primaryRoute)}
              className="group reveal grid gap-4 border-b border-white/12 py-8 transition-colors hover:bg-white/[0.03] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8"
            >
              <span className="mono-label text-sm font-bold text-white/30">{String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <h3 className="text-3xl font-black uppercase leading-[0.95] tracking-[-0.03em] text-white transition group-hover:text-[var(--slot4-accent)] sm:text-5xl">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-white/45">{getEditableExcerpt(post, 150)}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="mono-label text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">{getEditableCategory(post)}</span>
                <ArrowUpRight className="h-7 w-7 shrink-0 text-white/40 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--slot4-accent)]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- WORKING PROCESS (image 3) ---------------- */
export function EditableTimeCollections() {
  const process = pagesContent.home.process
  return (
    <section className="border-b border-white/10">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <div className="reveal flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-6">
          <p className="mono-label text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">→ {process.badge}</p>
          <p className="mono-label text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">{process.tag}</p>
        </div>
        <p className="reveal mt-6 max-w-md text-sm leading-7 text-white/55">{process.note}</p>

        <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {process.steps.map((step, index) => (
            <div key={step.title} className="reveal group relative flex min-h-[320px] flex-col justify-between bg-black p-8 transition-colors hover:bg-[var(--slot4-surface-bg)]">
              <div className="flex items-start justify-between">
                <span className="text-7xl font-black leading-none text-white/10 transition group-hover:text-[var(--slot4-accent)]/40">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="mono-label rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                  {step.step}
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase tracking-[-0.03em] text-white">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/50">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- CTA / SEARCH BAND ---------------- */
export function EditableHomeCta() {
  const cta = pagesContent.home.cta
  return (
    <section className="border-b border-white/10">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <div className="reveal grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mono-label text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">→ {cta.badge}</p>
            <h2 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.045em] sm:text-7xl">{cta.title}</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/55">{cta.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={cta.primaryCta.href} className={dc.button.accent}>{cta.primaryCta.label}</Link>
              <Link href={cta.secondaryCta.href} className={dc.button.secondary}>{cta.secondaryCta.label}</Link>
            </div>
          </div>

          <form action="/search" className="border border-white/12 bg-[var(--slot4-surface-bg)] p-7">
            <h3 className="text-2xl font-black uppercase tracking-[-0.03em]">Search the wire</h3>
            <p className="mt-2 text-sm text-white/50">Explore every update published by {SITE_CONFIG.name}.</p>
            <label className="mt-5 flex items-center border border-white/15 bg-black">
              <Search className="ml-4 h-4 w-4 text-white/40" />
              <input name="q" placeholder="Search updates" className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-white/35" />
              <button className="mono-label bg-[var(--slot4-accent)] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Go</button>
            </label>
          </form>
        </div>
      </div>
    </section>
  )
}
