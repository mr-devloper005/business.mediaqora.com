import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editablePalette as pal } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((value): value is string => typeof value === 'string' && Boolean(value))
  const directImage = ['featuredImage', 'image', 'thumbnail', 'coverImage', 'logo']
    .map((key) => content[key])
    .find((value): value is string => typeof value === 'string' && Boolean(value))
  return mediaUrl || directImage || contentImage || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof content.body === 'string' && content.body) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Update'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* ---------- Home cards: text only, no imagery (requirement #9) ---------- */

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className="group reveal flex w-[260px] shrink-0 snap-start flex-col justify-between border border-white/12 bg-[var(--slot4-surface-bg)] p-6 transition duration-500 hover:-translate-y-1.5 hover:border-[var(--slot4-accent)] sm:w-[300px]"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="mono-label text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</span>
          <span className="mono-label text-[11px] text-white/35">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <h3 className="mt-5 line-clamp-3 text-2xl font-black uppercase leading-[0.98] tracking-[-0.03em] text-white">{post.title}</h3>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/50">{getEditableExcerpt(post, 130)}</p>
      </div>
      <span className="mono-label mt-8 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 group-hover:text-[var(--slot4-accent)]">
        Read update <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group grid min-w-0 grid-cols-[44px_1fr] gap-4 border-t border-white/12 py-5 first:border-t-0">
      <span className="text-2xl font-black leading-none text-[var(--slot4-accent)]">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0">
        <p className="mono-label text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{getEditableCategory(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-base font-black uppercase leading-tight tracking-[-0.02em] text-white transition group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
      </div>
    </Link>
  )
}

/* ---------- Archive / article cards (imagery allowed) ---------- */

export function EditorialFeatureCard({ post, href, label = 'Featured' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className="group zoom-media block min-w-0 bg-black text-white">
      <div className="relative aspect-[16/10] min-h-[430px] overflow-hidden">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.9))]" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
          <span className="mono-label bg-[var(--slot4-accent-fill)] px-3 py-2 text-[10px] font-bold uppercase tracking-[.18em]">{label}</span>
          <h3 className="mt-5 max-w-4xl text-4xl font-black uppercase leading-[.95] tracking-[-.04em] sm:text-6xl">{post.title}</h3>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">{getEditableExcerpt(post, 190)}</p>
        </div>
      </div>
    </Link>
  )
}

export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group reveal grid min-w-0 border-t border-white/12 py-7 sm:grid-cols-[280px_minmax(0,1fr)] sm:gap-8">
      <div className="zoom-media relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="min-w-0 pt-4 sm:pt-1">
        <p className={`mono-label text-[11px] font-bold uppercase tracking-[0.22em] ${pal.accentText}`}>{String(index + 1).padStart(2, '0')} / {getEditableCategory(post)}</p>
        <h2 className="mt-3 line-clamp-3 text-3xl font-black uppercase leading-[1.0] tracking-[-0.04em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/50">{getEditableExcerpt(post, 190)}</p>
        <span className="mono-label mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">Read update <ArrowUpRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}
