import config from '@payload-config';
import { getPayload } from 'payload';

import { resolveAssetUrl } from './cdn/url';
import { FACULTY, type FacultyProfile } from './faculty';

/**
 * Faculty as the site reads them: the Payload `faculty` collection, mapped to
 * the FacultyProfile shape the pages already use. lib/faculty.ts is only the
 * fallback, used if the database cannot be read or holds no faculty at all, so
 * a CMS outage shows the last bundled list instead of empty department pages.
 */

type Row = { value?: string | null };
type Doc = Record<string, unknown>;

const strings = (rows: unknown): string[] =>
  (Array.isArray(rows) ? (rows as Row[]) : []).map((r) => (r?.value ?? '').trim()).filter(Boolean);

const text = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export function toProfile(doc: Doc): FacultyProfile {
  const name = text(doc.name) ?? '';
  const links = (doc.profileLinks ?? {}) as Record<string, unknown>;
  const photo = text(doc.photo);
  return {
    id: String(doc.slug ?? doc.id),
    slug: String(doc.slug ?? doc.id),
    name,
    designation: text(doc.designation) ?? '',
    isHod: Boolean(doc.isHod),
    department: String(doc.department ?? ''),
    qualifications: strings(doc.qualifications),
    specialization: strings(doc.specialization),
    experience: text(doc.experience),
    subjectsTaught: strings(doc.subjectsTaught),
    publications: strings(doc.publications),
    patents: strings(doc.patents),
    books: strings(doc.books),
    description: text(doc.description),
    email: text(doc.email),
    profileLinks: {
      linkedin: text(links.linkedin),
      googleScholar: text(links.googleScholar),
      scopus: text(links.scopus),
      orcid: text(links.orcid),
    },
    image: photo ? resolveAssetUrl(photo) : undefined,
    imageAlt: text(doc.imageAlt) ?? `Portrait of ${name}`,
    empId: text(doc.empId),
    hodMessage: text(doc.hodMessage),
  };
}

export async function getAllFaculty(): Promise<FacultyProfile[]> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'faculty',
      limit: 2000,
      depth: 0,
      pagination: false,
      sort: ['order', 'name'],
      overrideAccess: true,
    });
    if (docs.length) return docs.map((d) => toProfile(d as unknown as Doc));
  } catch (error) {
    console.error('faculty: reading the CMS failed, using the bundled list', error);
  }
  return FACULTY;
}

export async function getFacultyBySlug(slug: string): Promise<FacultyProfile | undefined> {
  return (await getAllFaculty()).find((f) => f.slug === slug);
}

export async function getFacultyByDepartment(department: string): Promise<FacultyProfile[]> {
  return (await getAllFaculty()).filter((f) => f.department === department);
}
