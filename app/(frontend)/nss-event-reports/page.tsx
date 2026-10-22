import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import { Section, H2, Lede } from '@/components/PageSection';

export const metadata: Metadata = {
  title: 'NSS Event Reports — MLRIT',
  description: 'Annual reports and event reports from the National Service Scheme (NSS) cell at MLR Institute of Technology.',
};

// Source: mlrit.ac.in/nss-event-reports/ — PDFs on files.mlrit.ac.in.
const DOCS = [
  { tag: 'Annual Report', label: 'NSS Annual Report 2025-26', href: 'https://files.mlrit.ac.in/uploads/NSS_Reports/NSS_Annual_Report_2025-2026.pdf' },
  { tag: 'Annual Report', label: 'NSS Annual Report 2024-25', href: 'https://files.mlrit.ac.in/uploads/NSS_Reports/NSS_Annual_Report_2024-2025.pdf' },
  { tag: 'Annual Report', label: 'NSS Annual Report 2023-24', href: 'https://files.mlrit.ac.in/uploads/NSS_Reports/NSS_Annual_Report_2023-2024.pdf' },
  { tag: 'Annual Report', label: 'NSS Annual Report 2022-23', href: 'https://files.mlrit.ac.in/uploads/NSS_Reports/NSS_Annual_Report_2022-2022.pdf' },
  { tag: 'Annual Report', label: 'NSS Annual Report 2021-22', href: 'https://files.mlrit.ac.in/uploads/NSS_Reports/NSS_Annual_Report_2021-2022.pdf' },
  { tag: 'Event Report', label: 'NAC Camp Report', href: 'https://files.mlrit.ac.in/uploads/NSS_Reports/NAC_CAMP_REPORT.pdf' },
];

export default function NssEventReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Student Life"
        title="NSS Event Reports"
        italic=""
        dek="Annual reports and event reports from the National Service Scheme cell at MLRIT."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'NSS Event Reports' }]}
      />

      <Section id="documents">
        <H2 italic="">Reports</H2>
        <Lede>NSS reports hosted on the institutional file server.</Lede>
        <div className="mt-5 md:mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {DOCS.map((d) => (
            <a
              key={d.label}
              href={d.href}
              target={d.href.startsWith('http') ? '_blank' : undefined}
              rel={d.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group block rounded-2xl border border-border bg-white p-4 md:p-6 hover:border-secondary hover:-translate-y-1 transition-all"
            >
              <div className="font-mono text-[0.62rem] font-bold tracking-[0.2em] uppercase text-secondary mb-2">{d.tag}</div>
              <div className="font-sans font-extrabold text-foreground text-[0.95rem] group-hover:text-secondary transition-colors leading-snug">{d.label}</div>
              <div className="mt-3 inline-flex items-center gap-1 text-secondary font-semibold text-[0.78rem] group-hover:gap-2 transition-all">Open →</div>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
