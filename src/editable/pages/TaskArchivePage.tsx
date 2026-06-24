import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowUpRight, Bookmark, BriefcaseBusiness, Building2, Camera, Download, FileText, Image as ImageIcon, MapPin, Megaphone, Search, Newspaper, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { fetchSiteFeed, type SiteFeedPagination, type SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const getSummary = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body)
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskDeck: Record<TaskKey, { icon: typeof FileText; archiveClass: string; promise: string; badge: string }> = {
  mediaDistribution: { icon: Newspaper, archiveClass: 'grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-3', promise: 'Newswire cards prioritize source, category, headline, and publication-ready summaries.', badge: 'News' },
  article: { icon: FileText, archiveClass: 'grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-3', promise: 'Readable editorial cards with room for headlines and excerpts.', badge: 'Read' },
  listing: { icon: Building2, archiveClass: 'grid gap-px bg-white/10 xl:grid-cols-2', promise: 'Directory cards highlight company identity, location, contacts, and service details.', badge: 'Business' },
  classified: { icon: Megaphone, archiveClass: 'grid gap-px bg-white/10 xl:grid-cols-2', promise: 'Offer-board cards prioritize price, location, condition, and quick action.', badge: 'Offer' },
  image: { icon: Camera, archiveClass: 'columns-1 gap-5 space-y-5 md:columns-2 xl:columns-3', promise: 'Gallery-first browsing with strong visuals and compact captions.', badge: 'Gallery' },
  sbm: { icon: Bookmark, archiveClass: 'grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-3', promise: 'Bookmark cards stay mostly text-based so saved resources scan quickly.', badge: 'Bookmark' },
  pdf: { icon: Download, archiveClass: 'grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-3', promise: 'Document cards surface file context, download intent, and summary.', badge: 'PDF' },
  profile: { icon: UserRound, archiveClass: 'grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4', promise: 'Profile cards focus on identity, short bio, and direct discovery.', badge: 'Profile' },
}

/**
 * Lenient real-data fallback (requirement: show REAL posts, never mock).
 *
 * `fetchPaginatedTaskPosts` filters strictly — it drops any post whose category is
 * not in the known CATEGORY_OPTIONS list and any post whose status is not exactly
 * "PUBLISHED". Real master-panel posts often carry custom categories, so that strict
 * pass can hide every real post and leave the archive empty. This fallback pulls the
 * same real feed (already scoped server-side by task) and filters only by task type,
 * so genuine posts surface. It uses live data only — it never falls back to mock.
 */
const getPostContentType = (post: SitePost) => {
  const content = post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const explicit = typeof content.type === 'string' ? content.type : ''
  if (explicit) return explicit
  if (Array.isArray(post.tags)) {
    const known = new Set(SITE_CONFIG.tasks.flatMap((item) => [item.key as string, item.contentType]))
    const tag = post.tags.find((item) => typeof item === 'string' && known.has(item))
    if (tag) return tag
  }
  return ''
}

async function fetchRealArchivePosts(task: TaskKey, page: number, limit: number, category: string) {
  const type = getTaskConfig(task)?.contentType || task
  const cat = category && category !== 'all' ? category : undefined
  // Fetch UNFILTERED by task: the master feed's server-side task filter can return
  // nothing even when matching posts exist (posts carry content.type but are not
  // task-tagged at the query level). We pull the recent feed and match client-side by
  // content.type, ignoring the strict category-allowlist that would otherwise hide
  // posts with custom categories. Pagination + category are applied client-side.
  const feed = await fetchSiteFeed(120, { fresh: true, timeoutMs: 6000 }).catch(() => null)
  const all = (feed?.posts || []).filter((post) => {
    const status = typeof (post as { status?: unknown }).status === 'string' ? String((post as { status?: unknown }).status).toUpperCase() : ''
    if (status && status !== 'PUBLISHED') return false
    const postType = getPostContentType(post)
    if (postType && postType !== type) return false
    if (cat) {
      const content = post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
      const postCategory = typeof content.category === 'string' ? content.category : ''
      if (postCategory && normalizeCategory(postCategory) !== cat) return false
    }
    return true
  })
  const total = all.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(page, totalPages)
  const posts = all.slice((safePage - 1) * limit, safePage * limit)
  const pagination: SiteFeedPagination = {
    page: safePage,
    limit,
    total,
    totalPages,
    hasPrevPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  }
  return { posts, pagination }
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)

  let { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  if (!posts.length) {
    const lenient = await fetchRealArchivePosts(task, page, 24, category)
    if (lenient.posts.length) {
      posts = lenient.posts
      pagination = lenient.pagination
    }
  }

  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const label = taskConfig?.label || task
  const deck = taskDeck[task]
  const Icon = deck.icon
  const dynamicCategories = Array.from(new Map([
    ...CATEGORY_OPTIONS,
    ...posts.map((post) => {
      const raw = getCategory(post, '')
      return raw ? { name: raw, slug: normalizeCategory(raw) } : null
    }).filter((item): item is { name: string; slug: string } => Boolean(item)),
  ].map((item) => [item.slug, item])).values())
  const categoryLabel = category === 'all' ? 'All categories' : dynamicCategories.find((item) => item.slug === category)?.name || category

  return (
    <EditorialArchive
      task={task}
      Icon={Icon}
      posts={posts}
      pagination={pagination}
      category={category}
      categoryLabel={categoryLabel}
      categories={dynamicCategories}
      basePath={basePath}
      label={label}
      promise={deck.promise}
      headline={voice?.headline}
      description={voice?.description}
      archiveClass={deck.archiveClass}
    />
  )
}

function EditorialArchive({
  task,
  Icon,
  posts,
  pagination,
  category,
  categoryLabel,
  categories,
  basePath,
  label,
  promise,
  headline,
  description,
  archiveClass,
}: {
  task: TaskKey
  Icon: typeof FileText
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  categoryLabel: string
  categories: { name: string; slug: string }[]
  basePath: string
  label: string
  promise: string
  headline?: string
  description?: string
  archiveClass: string
}) {
  const page = pagination.page || 1
  const lead = posts[0]
  const rest = posts.slice(1)
  const textOnly = task === 'sbm'

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-white">
        {/* Masthead */}
        <section className="border-b border-white/10">
          <div className={`${dc.shell.section} pb-12 pt-16 lg:pb-16 lg:pt-20`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="mono-label inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
                <Icon className="h-4 w-4" /> {label}
              </span>
              <span className="mono-label text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">{pagination.total ?? posts.length} updates</span>
            </div>
            <h1 className="mt-8 max-w-6xl text-6xl font-black uppercase leading-[0.84] tracking-[-0.05em] sm:text-8xl lg:text-[9rem]">
              {category === 'all' ? (headline || label) : categoryLabel}
            </h1>
            <p className="mt-8 max-w-2xl border-l-2 border-[var(--slot4-accent)] pl-6 text-base leading-8 text-white/60">{description || promise || SITE_CONFIG.description}</p>
          </div>
        </section>

        {/* Category tabs */}
        <section className="sticky top-[57px] z-30 border-b border-white/10 bg-black/85 backdrop-blur-xl">
          <div className={`${dc.shell.section} flex gap-7 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
            <Link href={basePath} className={`mono-label whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] ${category === 'all' ? 'text-[var(--slot4-accent)]' : 'text-white/60 hover:text-white'}`}>Latest</Link>
            {categories.slice(0, 10).map((item) => (
              <Link key={item.slug} href={pageHref(basePath, item.slug, 1)} className={`mono-label whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] ${category === item.slug ? 'text-[var(--slot4-accent)]' : 'text-white/60 hover:text-white'}`}>
                {item.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Posts */}
        <section className={`${dc.shell.section} pb-20 pt-12`}>
          {lead ? (
            <>
              {!textOnly ? <FeatureRow post={lead} href={`${basePath}/${lead.slug}`} label={getCategory(lead, label)} /> : null}
              {rest.length || textOnly ? (
                <div className={`mt-12 ${archiveClass}`}>
                  {(textOnly ? posts : rest).map((post, index) => (
                    <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="border border-dashed border-white/20 p-14 text-center">
              <Search className="mx-auto h-8 w-8 text-white/40" />
              <h2 className="mt-5 text-3xl font-black uppercase tracking-[-0.03em]">No updates found</h2>
              <p className="mt-3 text-sm text-white/45">Try another category or refresh after publishing new content.</p>
            </div>
          )}

          {(pagination.hasPrevPage || pagination.hasNextPage) ? (
            <div className="mt-14 flex items-center justify-center gap-3">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="mono-label rounded-full border border-white/20 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:border-white/50">Previous</Link> : null}
              <span className="mono-label rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white">Page {page} / {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="mono-label rounded-full border border-white/20 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:border-white/50">Next</Link> : null}
            </div>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function FeatureRow({ post, href, label }: { post: SitePost; href: string; label: string }) {
  return (
    <Link href={href} className="group reveal grid overflow-hidden border border-white/12 bg-black lg:grid-cols-[1.3fr_1fr]">
      <div className="zoom-media relative min-h-[300px] overflow-hidden bg-[var(--slot4-media-bg)] lg:min-h-[460px]">
        <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.5))]" />
      </div>
      <div className="flex flex-col justify-between gap-8 p-8 sm:p-12">
        <span className="mono-label w-fit bg-[var(--slot4-accent)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">{label}</span>
        <div>
          <h2 className="text-4xl font-black uppercase leading-[0.92] tracking-[-0.04em] text-white transition group-hover:text-[var(--slot4-accent)] sm:text-6xl">{post.title}</h2>
        
        </div>
        <span className="mono-label inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Read update <ArrowUpRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardShell({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link href={href} className="group reveal flex flex-col bg-black transition-colors hover:bg-white/[0.03]">
      {children}
    </Link>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <CardShell href={href}>
      <div className="zoom-media relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getImage(post)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="mono-label absolute left-4 top-4 bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">{getCategory(post, 'Update')}</span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <p className="mono-label text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">Update {String(index + 1).padStart(2, '0')}</p>
          <h2 className="mt-3 text-2xl font-black uppercase leading-[0.98] tracking-[-0.03em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
         
        </div>
        <span className="mono-label mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 group-hover:text-white">Read <ArrowUpRight className="h-4 w-4" /></span>
      </div>
    </CardShell>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  return (
    <CardShell href={href}>
      <div className="grid gap-5 p-6 sm:grid-cols-[110px_1fr]">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden bg-[var(--slot4-media-bg)]">
          {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-10 w-10 text-white/40" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="mono-label bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black">Directory</span>
            {location ? <span className="mono-label inline-flex items-center gap-1 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70"><MapPin className="h-3 w-3" /> {location}</span> : null}
          </div>
          <h2 className="mt-4 text-2xl font-black uppercase leading-tight tracking-[-0.03em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/45">{getSummary(post)}</p>
          {phone ? <p className="mono-label mt-4 text-[11px] uppercase tracking-[0.14em] text-white/50">Phone: {phone}</p> : null}
        </div>
      </div>
    </CardShell>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <CardShell href={href}>
      <div className="grid min-h-56 sm:grid-cols-[0.7fr_1fr]">
        <div className="relative bg-[var(--slot4-accent)] p-6 text-white">
          <span className="mono-label bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">Classified</span>
          <h2 className="mt-10 text-3xl font-black uppercase leading-[1] tracking-[-0.05em]">{price || 'Open offer'}</h2>
          <p className="mt-4 text-sm font-bold opacity-80">{location || condition || 'Details inside'}</p>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-black uppercase leading-tight tracking-[-0.03em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
          <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/45">{getSummary(post)}</p>
          <span className="mono-label mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">View listing <ArrowUpRight className="h-4 w-4" /></span>
        </div>
      </div>
    </CardShell>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group reveal mb-5 block break-inside-avoid bg-black">
      <div className={`zoom-media overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={getImage(post)} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="p-5">
        <div className="mono-label inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]"><ImageIcon className="h-3 w-3" /> Visual</div>
        <h2 className="mt-3 line-clamp-2 text-lg font-black uppercase leading-tight tracking-[-0.03em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <CardShell href={href}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="mono-label border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Save {String(index + 1).padStart(2, '0')}</span>
          <Bookmark className="h-5 w-5 text-[var(--slot4-accent)]" />
        </div>
        <h2 className="mt-7 text-2xl font-black uppercase leading-tight tracking-[-0.03em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
        <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/45">{getSummary(post)}</p>
        {website ? <p className="mono-label mt-5 truncate text-[11px] uppercase tracking-[0.14em] text-white/40">{website.replace(/^https?:\/\//, '')}</p> : null}
      </div>
    </CardShell>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <CardShell href={href}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="bg-[var(--slot4-accent)] p-4 text-white"><FileText className="h-7 w-7" /></div>
          <span className="mono-label border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{getCategory(post, 'PDF')}</span>
        </div>
        <h2 className="mt-7 text-2xl font-black uppercase leading-tight tracking-[-0.03em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
        <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/45">{getSummary(post)}</p>
        <span className="mono-label mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">Open document <Download className="h-4 w-4" /></span>
      </div>
    </CardShell>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <CardShell href={href}>
      <div className="p-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--slot4-media-bg)]">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-white/40" />}
        </div>
        <h2 className="mt-5 text-lg font-black uppercase leading-tight tracking-[-0.03em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h2>
        {role ? <p className="mono-label mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">{role}</p> : null}
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/45">{getSummary(post)}</p>
      </div>
    </CardShell>
  )
}
