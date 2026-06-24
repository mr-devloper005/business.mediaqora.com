import Link from 'next/link'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft, Bookmark, Building2, ExternalLink, FileText, Globe2, Mail, MapPin, MessageCircle, Phone, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { buildPostUrl, fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export const revalidate = 3

const detailVars = {
  '--detail-bg': '#070707',
  '--detail-text': '#f3f0ea',
  '--detail-surface': '#0b0b0b',
  '--detail-accent': '#ff5a1f',
} as CSSProperties

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' || task === 'mediaDistribution' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={detailVars} className="bg-[var(--detail-bg)] text-[var(--detail-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' || task === 'mediaDistribution' ? <ArticleDetail task={task} post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="mono-label inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 transition hover:text-[var(--detail-accent)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'updates'}
    </Link>
  )
}

/* Media Distribution / article detail — no date, no summary/overview (requirement #6) */
function ArticleDetail({ task, post, related, comments }: { task: TaskKey; post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <section>
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 lg:py-16">
          <BackLink task={task} />
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/12 pt-5">
            <span className="mono-label bg-[var(--detail-accent)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">{categoryOf(post, 'News')}</span>
            <span className="mono-label text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">{SITE_CONFIG.name}</span>
          </div>
          <h1 className="mt-7 max-w-6xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.05em] sm:text-7xl lg:text-[5.5rem]">{post.title}</h1>
        </div>
      </header>

      {images[0] ? (
        <figure className="mx-auto max-w-[1320px]">
          <div className="zoom-media overflow-hidden bg-[var(--slot4-media-bg)]">
            <img src={images[0]} alt="" className="max-h-[720px] w-full object-cover" />
          </div>
        </figure>
      ) : null}

      <div className="mx-auto grid max-w-[1180px] gap-14 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,760px)_320px] lg:py-20">
        <article className="min-w-0 border-t border-white/12 pt-10">
          <BodyContent post={post} />
          <EditableComments slug={post.slug} comments={comments} />
        </article>
        <div className="border-t-2 border-[var(--detail-accent)] pt-6">
          <RelatedPanel task={task} post={post} related={related} />
        </div>
      </div>
    </section>
  )
}

function DetailHeader({ task, eyebrow, title, summary }: { task: TaskKey; eyebrow: string; title: string; summary?: string }) {
  return (
    <div>
      <BackLink task={task} />
      <p className="mono-label mt-8 text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--detail-accent)]">{eyebrow}</p>
      <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-6xl">{title}</h1>
      {summary ? <p className="mt-5 max-w-3xl text-base leading-8 text-white/55">{summary}</p> : null}
    </div>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <article className="border border-white/12 bg-[var(--detail-surface)] p-7 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-[140px_1fr]">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden bg-[var(--slot4-media-bg)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-14 w-14 text-white/40" />}
            </div>
            <DetailHeader task="listing" eyebrow="Business listing" title={post.title} summary={summaryText(post)} />
          </div>
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <BodyContent post={post} />
          <ImageStrip images={images.slice(1)} label="Business showcase" />
        </article>
        <aside className="space-y-5">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
          <RelatedPanel task="listing" post={post} related={related} compact />
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <section className="mx-auto grid max-w-[var(--editable-container)] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:py-20">
      <aside className="bg-[var(--detail-accent)] p-7 text-white lg:sticky lg:top-24 lg:self-start">
        <BackLink task="classified" />
        <p className="mono-label mt-10 text-[11px] font-bold uppercase tracking-[0.26em] opacity-80">Classified notice</p>
        <h1 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em] sm:text-5xl">{post.title}</h1>
        <div className="mt-8 grid gap-3">
          {price ? <BadgeLine label="Price" value={price} /> : null}
          {condition ? <BadgeLine label="Condition" value={condition} /> : null}
          {location ? <BadgeLine label="Location" value={location} /> : null}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {phone ? <a href={`tel:${phone}`} className="mono-label rounded-full bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Call now</a> : null}
          {email ? <a href={`mailto:${email}`} className="mono-label rounded-full border border-white/40 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em]">Email</a> : null}
        </div>
      </aside>
      <article className="border border-white/12 bg-[var(--detail-surface)] p-7 sm:p-10">
        <ImageStrip images={images} label="Offer images" large />
        <BodyContent post={post} />
        <ContactAction website={website} phone={phone} email={email} />
        <RelatedPanel task="classified" post={post} related={related} />
      </article>
    </section>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-5 py-14 sm:px-8 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="border border-white/12 bg-[var(--detail-surface)] p-7 lg:sticky lg:top-24 lg:self-start">
          <DetailHeader task="image" eyebrow="Image story" title={post.title} summary={summaryText(post)} />
          <BodyContent post={post} compact />
        </aside>
        <div className="columns-1 gap-5 space-y-5 md:columns-2">
          {(images.length ? images : ['/placeholder.svg?height=900&width=1200']).map((image, index) => (
            <figure key={`${image}-${index}`} className="zoom-media break-inside-avoid overflow-hidden border border-white/12 bg-[var(--slot4-media-bg)]">
              <img src={image} alt="" className="w-full object-cover" />
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-12"><RelatedPanel task="image" post={post} related={related} /></div>
    </section>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-20">
      <article className="border border-white/12 bg-[var(--detail-surface)] p-7 sm:p-10">
        <div className="flex h-16 w-16 items-center justify-center bg-[var(--detail-accent)] text-white"><Bookmark className="h-7 w-7" /></div>
        <DetailHeader task="sbm" eyebrow="Saved resource" title={post.title} summary={summaryText(post)} />
        {website ? <Link href={website} target="_blank" rel="noreferrer" className="mono-label mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-[var(--detail-accent)] hover:text-white">Open saved resource <ExternalLink className="h-4 w-4" /></Link> : null}
        <BodyContent post={post} />
      </article>
      <RelatedPanel task="sbm" post={post} related={related} />
    </section>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-20">
      <article className="border border-white/12 bg-[var(--detail-surface)] p-7 sm:p-10">
        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center bg-[var(--detail-accent)] text-white"><FileText className="h-11 w-11" /></div>
          <DetailHeader task="pdf" eyebrow="PDF resource" title={post.title} />
        </div>
        <BodyContent post={post} />
        {fileUrl ? (
          <div className="mt-8 overflow-hidden border border-white/12">
            <div className="flex items-center justify-between gap-3 border-b border-white/12 bg-black p-4">
              <span className="text-sm font-black uppercase tracking-[-0.01em]">Document preview</span>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mono-label inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-[var(--detail-accent)] hover:text-white">Download</Link>
            </div>
            <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-white" />
          </div>
        ) : null}
      </article>
      <RelatedPanel task="pdf" post={post} related={related} />
    </section>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:py-20">
      <aside className="border border-white/12 bg-[var(--detail-surface)] p-8 text-center lg:sticky lg:top-24 lg:self-start">
        <BackLink task="profile" />
        <div className="mx-auto mt-10 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-[var(--slot4-media-bg)]">
          {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-16 w-16 text-white/40" />}
        </div>
        <h1 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em]">{post.title}</h1>
        {role ? <p className="mono-label mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--detail-accent)]">{role}</p> : null}
        <ContactAction website={website} email={email} />
      </aside>
      <article className="border border-white/12 bg-[var(--detail-surface)] p-7 sm:p-10">
        <BodyContent post={post} />
        <ImageStrip images={images.slice(1)} label="Profile gallery" />
        <RelatedPanel task="profile" post={post} related={related} />
      </article>
    </section>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return <div className={`article-content max-w-none ${compact ? 'text-base leading-8' : 'text-lg leading-9'}`} dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }} />
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-px bg-white/10 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="bg-black p-4">
          <div className="mono-label flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45"><Icon className="h-4 w-4" /> {label}</div>
          <p className="mt-2 break-words text-sm font-bold leading-6 text-white/80">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-8">
      <p className="mono-label text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--detail-accent)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden border border-white/12 bg-[var(--detail-surface)]">
      <div className="flex items-center gap-2 p-4 text-sm font-black"><MapPin className="h-4 w-4 text-[var(--detail-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-80 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email }: { website?: string; phone?: string; email?: string }) {
  if (!website && !phone && !email) return null
  return (
    <div className="mt-5 border border-white/12 bg-[var(--detail-surface)] p-5">
      <p className="mono-label text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">Quick actions</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {website ? <Link href={website} target="_blank" rel="noreferrer" className="mono-label inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-[var(--detail-accent)] hover:text-white">Website <ExternalLink className="h-4 w-4" /></Link> : null}
        {phone ? <a href={`tel:${phone}`} className="mono-label inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:border-white/50"><Phone className="h-4 w-4" /> Call</a> : null}
        {email ? <a href={`mailto:${email}`} className="mono-label inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:border-white/50"><Mail className="h-4 w-4" /> Email</a> : null}
      </div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 bg-black/25 px-4 py-3 text-sm"><span className="mono-label text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">{label}</span><span className="font-black">{value}</span></div>
}

function RelatedPanel({ task, related, compact = false }: { task: TaskKey; post?: SitePost; related: SitePost[]; compact?: boolean }) {
  const taskConfig = getTaskConfig(task)
  return (
    <aside className="min-w-0 space-y-6">
      {!compact ? (
        <div className="border border-white/12 bg-[var(--detail-surface)] p-5">
          <p className="mono-label text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">About this update</p>
          <div className="mt-4 grid gap-3 text-sm font-bold text-white/70">
            <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--detail-accent)]" /> {taskConfig?.label || task}</p>
            <p className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4 text-[var(--detail-accent)]" /> {SITE_CONFIG.name}</p>
          </div>
        </div>
      ) : null}
      {related.length ? (
        <div className="border border-white/12 bg-[var(--detail-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black uppercase tracking-[-0.03em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="mono-label text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 hover:text-white">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function RelatedCard({ task, post }: { task: TaskKey; post: SitePost }) {
  const image = getImages(post)[0]
  return (
    <Link href={buildPostUrl(task, post.slug)} className="group flex gap-3 border-t border-white/10 py-3 transition hover:text-[var(--detail-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-20 w-20 shrink-0 object-cover" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-[var(--slot4-media-bg)] text-white"><FileText className="h-6 w-6" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-3 text-sm font-black uppercase leading-tight tracking-[-0.02em] text-white group-hover:text-[var(--detail-accent)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">{summaryText(post)}</p>
      </div>
    </Link>
  )
}

function EditableComments({ slug, comments }: { slug: string; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <section className="mt-14 border-t border-white/12 pt-8">
      <div className="flex items-center gap-2 text-lg font-black uppercase tracking-[-0.02em]"><MessageCircle className="h-5 w-5 text-[var(--detail-accent)]" /> Comments</div>
      <div className="mt-5 grid gap-3">
        {comments.slice(0, 5).map((comment) => (
          <div key={comment.id} className="border-t border-white/10 py-4">
            <p className="text-sm font-black">{comment.name}</p>
            <p className="mt-2 text-sm leading-6 text-white/55">{comment.comment}</p>
          </div>
        ))}
        {!comments.length ? <p className="text-sm text-white/45">No comments yet for {slug}.</p> : null}
      </div>
    </section>
  )
}
