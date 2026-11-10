import { getAllFaculty } from '@/lib/faculty-store';

// The header's search box loads this once. Slim on purpose: every faculty
// profile with its publications would be megabytes for a name lookup.
export const revalidate = 300;

export async function GET() {
  const faculty = await getAllFaculty();
  return Response.json(
    faculty.map((f) => ({
      slug: f.slug,
      name: f.name,
      designation: f.designation,
      isHod: Boolean(f.isHod),
      department: f.department,
      specialization: f.specialization[0] ?? '',
      subjects: f.subjectsTaught.join(' '),
    }))
  );
}
