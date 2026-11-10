import { resolveAssetUrl } from '../cdn/url';
import { asRepeaterItems, asText } from './sections';
import { CIRCULAR_CATEGORIES, DEFAULT_CIRCULARS, type CircularCategory } from './circulars-data';

export type Circular = {
  id: string;
  title: string;
  category: CircularCategory;
  date: string;
  href: string;
  filename: string;
};

const asCategory = (value: unknown): CircularCategory =>
  CIRCULAR_CATEGORIES.find((c) => c.toLowerCase() === asText(value).trim().toLowerCase()) ?? 'Notice';

/**
 * The circulars to show: every CMS row plus the bundled ones. Saving the list
 * in the admin used to replace the bundled circulars with whatever was saved,
 * so the older ones vanished from the page; now they always stay, and a CMS row
 * for the same file takes the place of its bundled copy (so an edited title or
 * date wins). Rows missing a title or a file are skipped rather than rendered as a
 * dead card. Newest first by the date text (which may be just a month or a
 * year); the sort is stable, so same-day circulars keep their listed order and
 * a date that cannot be read leaves the row where it is.
 */
export function circularsFrom(value: unknown): Circular[] {
  const saved = asRepeaterItems(value);
  const savedFiles = new Set(saved.map((row) => resolveAssetUrl(asText(row.file).trim())));
  const rows: readonly { id: string; [k: string]: unknown }[] = [
    ...saved,
    ...DEFAULT_CIRCULARS.filter((row) => !savedFiles.has(resolveAssetUrl(row.file))),
  ];

  return rows
    .map((row) => {
      const href = resolveAssetUrl(asText(row.file).trim());
      const title = asText(row.title).trim();
      if (!href || !title) return null;
      const last = href.split('?')[0].split('/').pop() ?? '';
      let filename = last;
      try { filename = decodeURIComponent(last); } catch {}
      return { id: row.id, title, category: asCategory(row.category), date: asText(row.date).trim(), href, filename };
    })
    .filter((c): c is Circular => c !== null)
    .map((c, i) => ({ c, i, t: Date.parse(c.date) }))
    .sort((x, y) => (Number.isNaN(x.t) || Number.isNaN(y.t) ? x.i - y.i : y.t - x.t || x.i - y.i))
    .map(({ c }) => c);
}
