import { randomUUID } from 'node:crypto'

import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

import { DEPT_DATA } from '../lib/dept-data'
import { FACULTY } from '../lib/faculty'

/**
 * Copies the bundled faculty into the `faculty` collection: the 224 profiles
 * from lib/faculty.ts, plus the name cards that CSIT and IT carried in
 * lib/dept-data.ts (those two departments have no profile pages). Heads of
 * department keep their message from dept-data. Runs once, and skips any slug
 * that already exists, so a re-run cannot duplicate or overwrite an edit.
 */

const list = (items: string[] | undefined) => (items ?? []).map((value) => ({ value }))

const slugify = (text: string) =>
  text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

type Seed = Record<string, unknown> & { slug: string; name: string; designation: string; department: string }

const pl = (f: Seed, key: string): string | null => ((f.profileLinks as Record<string, string | undefined> | undefined)?.[key]) || null

function buildSeeds(): Seed[] {
  const seeds: Seed[] = []
  const hodSeen: Record<string, number> = {}
  const position: Record<string, number> = {}

  for (const f of FACULTY) {
    position[f.department] = (position[f.department] ?? 0) + 1
    let hodMessage: string | undefined
    if (f.isHod) {
      const n = (hodSeen[f.department] = (hodSeen[f.department] ?? 0) + 1)
      const data = DEPT_DATA[f.department]
      hodMessage = (n === 1 ? data?.hodMessage : data?.hod2Message) || undefined
    }
    seeds.push({
      slug: f.slug,
      name: f.name,
      designation: f.designation,
      department: f.department,
      isHod: Boolean(f.isHod),
      hodMessage,
      photo: f.image || undefined,
      imageAlt: f.imageAlt || undefined,
      qualifications: list(f.qualifications),
      specialization: list(f.specialization),
      experience: f.experience || undefined,
      subjectsTaught: list(f.subjectsTaught),
      publications: list(f.publications),
      patents: list(f.patents),
      books: list(f.books),
      description: f.description || undefined,
      email: f.email || undefined,
      profileLinks: f.profileLinks ?? {},
      empId: f.empId || undefined,
      order: position[f.department] * 10,
    })
  }

  // Departments whose people were only name cards (no profile records).
  const taken = new Set(seeds.map((s) => s.slug))
  for (const [department, data] of Object.entries(DEPT_DATA)) {
    if (FACULTY.some((f) => f.department === department)) continue
    data.faculty.forEach((m, i) => {
      let slug = `${slugify(m.name)}-${department}`
      for (let n = 2; taken.has(slug); n += 1) slug = `${slugify(m.name)}-${department}-${n}`
      taken.add(slug)
      const isHod = /head|hod/i.test(m.role)
      seeds.push({
        slug,
        name: m.name,
        designation: m.role,
        department,
        isHod,
        hodMessage: isHod ? data.hodMessage || undefined : undefined,
        photo: m.photo || undefined,
        imageAlt: `Portrait of ${m.name}`,
        specialization: list(m.specialization ? [m.specialization] : []),
        order: (i + 1) * 10,
      })
    })
  }
  return seeds
}

const chunks = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, n) => items.slice(n * size, (n + 1) * size))

// Set-based inserts: a few statements in all. Creating each person through the
// Payload API took minutes against the remote database and hit the deploy's
// migration timeout.
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const seeds = buildSeeds()
  const idBySlug = new Map<string, number>()

  for (const batch of chunks(seeds, 100)) {
    const values = batch.map(
      (f) => sql`(${f.name}, ${f.designation}, ${f.department}::"payload"."enum_faculty_department", ${f.isHod ?? false}, ${f.hodMessage ?? null}, ${f.photo ?? null}, ${f.imageAlt ?? null}, ${f.experience ?? null}, ${f.description ?? null}, ${f.email ?? null}, ${pl(f, 'linkedin')}, ${pl(f, 'googleScholar')}, ${pl(f, 'scopus')}, ${pl(f, 'orcid')}, ${f.empId ?? null}, ${f.order ?? 1000}, ${f.slug})`
    )
    const res = await db.execute(sql`
      INSERT INTO "payload"."faculty" ("name", "designation", "department", "is_hod", "hod_message", "photo", "image_alt", "experience", "description", "email", "profile_links_linkedin", "profile_links_google_scholar", "profile_links_scopus", "profile_links_orcid", "emp_id", "order", "slug")
      VALUES ${sql.join(values, sql`, `)}
      ON CONFLICT ("slug") DO NOTHING
      RETURNING "id", "slug"`)
    for (const row of res.rows as { id: number; slug: string }[]) idBySlug.set(row.slug, row.id)
  }

  const lists: [string, string][] = [
    ['faculty_qualifications', 'qualifications'],
    ['faculty_specialization', 'specialization'],
    ['faculty_subjects_taught', 'subjectsTaught'],
    ['faculty_publications', 'publications'],
    ['faculty_patents', 'patents'],
    ['faculty_books', 'books'],
  ]
  for (const [table, key] of lists) {
    const rows: { parent: number; order: number; value: string }[] = []
    for (const f of seeds) {
      const parent = idBySlug.get(f.slug)
      if (parent === undefined) continue // already existed: leave its lists alone
      ;((f[key] as { value: string }[] | undefined) ?? []).forEach((e, n) =>
        rows.push({ parent, order: n + 1, value: e.value })
      )
    }
    for (const batch of chunks(rows, 400)) {
      const values = batch.map((r) => sql`(${r.order}, ${r.parent}, ${randomUUID()}, ${r.value})`)
      await db.execute(sql`
        INSERT INTO ${sql.raw(`"payload"."${table}"`)} ("_order", "_parent_id", "id", "value")
        VALUES ${sql.join(values, sql`, `)}`)
    }
  }
  payload.logger.info(`faculty seed: created ${idBySlug.size} of ${seeds.length}`)
}

// The table itself is dropped by the schema migration's down(); nothing to undo here.
export async function down(_: MigrateDownArgs): Promise<void> {}
