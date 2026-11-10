import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

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

type Seed = Record<string, unknown> & { slug: string }

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

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const existing = await payload.find({
    collection: 'faculty',
    limit: 5000,
    pagination: false,
    depth: 0,
    select: { slug: true },
    req,
  })
  const have = new Set(existing.docs.map((d) => (d as { slug?: string }).slug))

  let created = 0
  for (const seed of buildSeeds()) {
    if (have.has(seed.slug)) continue
    await payload.create({ collection: 'faculty', data: seed as never, depth: 0, overrideAccess: true, req })
    created += 1
  }
  payload.logger.info(`faculty seed: created ${created} of ${buildSeeds().length}`)
}

// The table itself is dropped by the schema migration's down(); nothing to undo here.
export async function down(_: MigrateDownArgs): Promise<void> {}
