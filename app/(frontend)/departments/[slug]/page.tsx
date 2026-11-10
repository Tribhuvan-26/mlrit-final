import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEPARTMENTS, getDepartment } from '@/lib/departments';
import DepartmentDetail from '@/components/sections/DepartmentDetail';
import { getFacultyByDepartment } from '@/lib/faculty-store';

export const revalidate = 60;

export function generateStaticParams() {
  return DEPARTMENTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const d = getDepartment(params.slug);
  if (!d) return { title: 'Department — MLRIT' };
  return { title: `${d.name} — MLRIT`, description: d.tagline };
}

export default async function DepartmentPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const d = getDepartment(params.slug);
  if (!d) notFound();
  const faculty = await getFacultyByDepartment(d.slug);
  return <DepartmentDetail department={d} faculty={faculty} />;
}
