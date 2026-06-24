'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  mediaDistribution: Sparkles,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: ArrowUpRight,
}

const fieldClass = 'border border-white/15 bg-black px-4 py-3.5 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'mediaDistribution') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] text-white">
          <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
            <div className="grid items-stretch gap-px overflow-hidden border border-white/12 bg-white/10 md:grid-cols-[0.9fr_1.1fr]">
              <div className="flex min-h-72 items-center justify-center bg-black">
                <Lock className="h-20 w-20 text-[var(--slot4-accent)]" />
              </div>
              <div className="bg-[var(--slot4-surface-bg)] p-8 sm:p-12">
                <p className="mono-label text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">→ {pagesContent.create.locked.badge}</p>
                <h1 className="mt-6 text-5xl font-black uppercase leading-[0.88] tracking-[-0.05em] sm:text-7xl">{pagesContent.create.locked.title}</h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-white/55">{pagesContent.create.locked.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/login" className={dc.button.accent}>Login <ArrowUpRight className="h-4 w-4" /></Link>
                  <Link href="/signup" className={dc.button.secondary}>Sign up</Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-white">
        <section className={`${dc.shell.section} ${dc.shell.sectionY} grid gap-12 lg:grid-cols-[0.85fr_1.15fr]`}>
          <aside className="reveal">
            <p className="mono-label text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">→ {pagesContent.create.hero.badge}</p>
            <h1 className="mt-6 text-5xl font-black uppercase leading-[0.88] tracking-[-0.05em] sm:text-7xl">{pagesContent.create.hero.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/55">{pagesContent.create.hero.description}</p>
            <div className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2">
              {enabledTasks.map((item) => {
                const Icon = taskIcon[item.key] || FileText
                const active = item.key === task
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTask(item.key)}
                    className={`p-5 text-left transition ${active ? 'bg-[var(--slot4-accent)] text-white' : 'bg-black text-white hover:bg-white/[0.04]'}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="mt-3 block text-sm font-black uppercase tracking-[-0.01em]">{item.label}</span>
                    <span className={`mt-1 block text-xs ${active ? 'text-white/80' : 'text-white/45'}`}>{item.description}</span>
                  </button>
                )
              })}
            </div>
          </aside>

          <form onSubmit={submit} className="reveal border border-white/12 bg-[var(--slot4-surface-bg)] p-6 sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mono-label text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Create {activeTask?.label || 'update'}</p>
                <h2 className="mt-1 text-3xl font-black uppercase tracking-[-0.04em]">{pagesContent.create.formTitle}</h2>
              </div>
              <span className="mono-label rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">{session.name}</span>
            </div>

            <div className="mt-7 grid gap-4">
              <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Update title" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Source or website URL" />
              </div>
              <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
              <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
              <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, sources, or description" required />
            </div>

            {created ? (
              <div className="mt-5 flex items-center gap-3 border border-[var(--slot4-accent)]/40 bg-[var(--slot4-accent-soft)] p-4 text-white">
                <CheckCircle2 className="h-5 w-5 text-[var(--slot4-accent)]" />
                <div>
                  <p className="text-sm font-black">{pagesContent.create.successTitle}</p>
                  <p className="text-sm text-white/60">{created.title}</p>
                </div>
              </div>
            ) : null}

            <button type="submit" className="mono-label mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[var(--slot4-accent)] hover:text-white">
              <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
            </button>
          </form>
        </section>
      </main>
    </EditableSiteShell>
  )
}
