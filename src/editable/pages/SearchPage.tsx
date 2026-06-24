import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { buildPostUrl, getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const href = task ? buildPostUrl(task, post.slug) : `/article/${post.slug}`
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Update'

  return (
    <Link href={href} className="group reveal flex flex-col justify-between border-b border-r border-white/12 bg-black p-6 transition-colors hover:bg-white/[0.03]">
      <div>
        <div className="flex items-center justify-between">
          <span className="mono-label bg-[var(--slot4-accent)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">{taskLabel}</span>
          <span className="mono-label text-[11px] text-white/30">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className="mt-5 line-clamp-3 text-2xl font-black uppercase leading-[1.0] tracking-[-0.03em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
        {summary ? <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/50">{summary}</p> : null}
      </div>
      <span className="mono-label mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 group-hover:text-white">Open result <ArrowUpRight className="h-4 w-4" /></span>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-white">
        <section className="border-b border-white/10">
          <div className={`${dc.shell.section} grid gap-12 pb-12 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:pb-16 lg:pt-20`}>
            <div>
              <p className="mono-label text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">→ {pagesContent.search.hero.badge}</p>
              <h1 className="mt-7 text-6xl font-black uppercase leading-[0.86] tracking-[-0.05em] sm:text-7xl">{pagesContent.search.hero.title}</h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-white/55">{pagesContent.search.hero.description}</p>
            </div>
            <form action="/search" className="self-center border border-white/12 bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 border border-white/15 bg-black px-4 py-3.5">
                <Search className="h-5 w-5 text-white/35" />
                <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-base font-bold text-white outline-none placeholder:text-white/30" />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 border border-white/15 bg-black px-4 py-3.5">
                  <Filter className="h-4 w-4 text-white/35" />
                  <input name="category" defaultValue={category} placeholder="Category" className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/30" />
                </label>
                <select name="task" defaultValue={task} className="border border-white/15 bg-black px-4 py-3.5 text-sm font-bold text-white outline-none">
                  <option value="">All content types</option>
                  {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
              </div>
              <button className="mono-label mt-3 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[var(--slot4-accent)] hover:text-white" type="submit">Search the wire</button>
            </form>
          </div>
        </section>

        <section className={`${dc.shell.section} pb-20 pt-12`}>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-6">
            <div>
              <p className="mono-label text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">{results.length} results</p>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em]">{query ? `Results for “${query}”` : pagesContent.search.resultsTitle}</h2>
            </div>
            <Link href="/" className="mono-label inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:border-white/50">Browse latest <ArrowUpRight className="h-4 w-4" /></Link>
          </div>

          {results.length ? (
            <div className="mt-8 grid border-l border-t border-white/12 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
            </div>
          ) : (
            <div className="mt-10 border border-dashed border-white/20 p-12 text-center">
              <p className="text-2xl font-black uppercase tracking-[-0.03em]">No matching updates found.</p>
              <p className="mt-3 text-sm text-white/45">Try a different keyword, content type, or category.</p>
            </div>
          )}
        </section>
      </main>
    </EditableSiteShell>
  )
}
