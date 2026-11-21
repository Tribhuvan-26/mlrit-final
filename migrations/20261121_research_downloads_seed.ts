import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { DEFAULT_DOWNLOADS } from '../lib/content/downloads'

/**
 * Puts the eleven documents the Research, Downloads page lists into the
 * Documents list in the admin, with the links to the six that have a file, so
 * each can be edited, replaced, removed, or joined by new ones there.
 *
 * Only documents whose title is not already in the list are added, so a re-run
 * changes nothing and an edit made in the admin is never overwritten. The
 * migration runs once, so a document deleted afterwards stays deleted.
 */
const SLUG = 'research-downloads' as const

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const current = (await payload.findGlobal({ slug: SLUG, depth: 0, overrideAccess: true, req })) as {
    documents?: { title?: string | null }[] | null
  }
  const list = current.documents ?? []
  const have = new Set(list.map((d) => String(d.title ?? '').trim()))
  const fresh = DEFAULT_DOWNLOADS.filter((d) => !have.has(d.title)).map(({ id, ...d }) => ({ ...d, itemId: id }))
  if (!fresh.length) return

  await payload.updateGlobal({
    slug: SLUG,
    data: { documents: [...list, ...fresh], _status: 'published' } as never,
    depth: 0,
    overrideAccess: true,
    req,
  })
  payload.logger.info(`research downloads: added ${fresh.length} to the existing ${list.length}`)
}

// The documents are ordinary CMS content from here on; nothing to undo.
export async function down(_: MigrateDownArgs): Promise<void> {}
