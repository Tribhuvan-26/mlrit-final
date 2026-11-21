import type { Metadata } from 'next';
import ResearchQuickNav from '@/components/ResearchQuickNav';
import { Downloads } from '@/components/ResearchOverviewSections';
import { getSection } from '@/lib/content/client';
import { asText } from '@/lib/content/sections';

export const metadata: Metadata = { title: 'Downloads — MLRIT Research' };

// Edited under Research, Downloads in the admin; a publish shows within a minute.
export const revalidate = 60;

export default async function ResearchDownloadsPage() {
  const row = await getSection('research', 'downloads').catch(() => null);
  const c = (row?.content ?? {}) as Record<string, unknown>;
  const text = (key: string) => asText(c[key]) || undefined;

  return (
    <>
      <ResearchQuickNav active="/research/downloads" />
      <Downloads
        eyebrow={text('eyebrow')}
        titleLead={text('titleLead')}
        titleAccent={text('titleAccent')}
        intro={text('intro')}
        email={text('email')}
        note={text('note')}
        documents={c.documents}
      />
    </>
  );
}
