import type { FacultyProfile } from './faculty';

/**
 * True when there is more to show than a name card. Cards without it do not
 * link to a profile page, since that page would be a name and nothing else.
 * Specialization is left out on purpose: the cards already show it.
 */
export const hasProfile = (f: FacultyProfile): boolean =>
  Boolean(
    f.description || f.qualifications.length || f.subjectsTaught.length || f.publications.length ||
      f.patents.length || f.books.length || f.email || f.experience
  );
