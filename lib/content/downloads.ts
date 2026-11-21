import { resolveAssetUrl } from '../cdn/url';
import { asRepeaterItems, asText } from './sections';

export type DownloadItem = { id: string; title: string; href?: string };

/**
 * The research documents shown on /research/downloads. The CMS list is the whole
 * truth once it has rows (deleting a row removes the document); the bundled list
 * is only the fallback for a list that was never filled in. A row without a file
 * has no `href`, and the page shows a Request link for it. Rows without a title
 * are skipped.
 */
export const DEFAULT_DOWNLOADS: readonly { id: string; title: string; file: string }[] = [
  { id: 'publication-incentive-form', title: 'Publication Incentive Form', file: '/research/downloads/publication-incentive-form.pdf' },
  { id: 'patent-filing-invention-disclosure-form', title: 'Patent Filing / Invention Disclosure Form', file: '/research/downloads/invention-disclosure-form.pdf' },
  { id: 'sponsored-project-proposal-form', title: 'Sponsored Project Proposal Form', file: '' },
  { id: 'consultancy-agreement-template', title: 'Consultancy Agreement Template', file: '' },
  { id: 'patent-incentive-claim-form', title: 'Patent Incentive Claim Form', file: '' },
  { id: 'travel-support-conference-form', title: 'Travel Support — Conference Form', file: '' },
  { id: 'research-incentive-scheme-full-document', title: 'Research Incentive Scheme (Full Document)', file: '' },
  { id: 'rd-policy-document', title: 'R&D Policy Document', file: '/research/downloads/research-and-development-policy.pdf' },
  { id: 'ip-policy-document', title: 'IP Policy Document', file: '/research/downloads/ip-policy.pdf' },
  { id: 'consultancy-policy-document', title: 'Consultancy Policy Document', file: '/research/downloads/consultancy-policy.pdf' },
  { id: 'innovation-entrepreneurship-policy', title: 'Innovation & Entrepreneurship Policy', file: '/research/downloads/innovation-and-entrepreneurship-policy.pdf' },
];

export function downloadsFrom(value: unknown): DownloadItem[] {
  const saved = asRepeaterItems(value);
  const rows: readonly { id: string; [k: string]: unknown }[] = saved.length ? saved : DEFAULT_DOWNLOADS;

  return rows
    .map((row) => {
      const title = asText(row.title).trim();
      if (!title) return null;
      const href = resolveAssetUrl(asText(row.file).trim());
      return { id: row.id, title, href: href || undefined };
    })
    .filter((d): d is DownloadItem => d !== null);
}
