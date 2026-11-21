import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_research_downloads_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__research_downloads_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "payload"."enum_users_sections" ADD VALUE 'research/downloads' BEFORE 'research/support';
  CREATE TABLE "payload"."research_downloads_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"file" varchar,
  	"item_id" varchar
  );
  
  CREATE TABLE "payload"."research_downloads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT '09 · Downloads',
  	"title_lead" varchar DEFAULT 'Forms and documents',
  	"title_accent" varchar DEFAULT 'for researchers.',
  	"intro" varchar DEFAULT 'Forms and policy documents with a download link are ready to open; for any other document, request it from the R&D Cell by writing to',
  	"email" varchar DEFAULT 'deanresearch@mlrit.ac.in',
  	"note" varchar DEFAULT 'Documents are dispatched within two working days of request.',
  	"_status" "payload"."enum_research_downloads_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."_research_downloads_v_version_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"file" varchar,
  	"item_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_research_downloads_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_eyebrow" varchar DEFAULT '09 · Downloads',
  	"version_title_lead" varchar DEFAULT 'Forms and documents',
  	"version_title_accent" varchar DEFAULT 'for researchers.',
  	"version_intro" varchar DEFAULT 'Forms and policy documents with a download link are ready to open; for any other document, request it from the R&D Cell by writing to',
  	"version_email" varchar DEFAULT 'deanresearch@mlrit.ac.in',
  	"version_note" varchar DEFAULT 'Documents are dispatched within two working days of request.',
  	"version__status" "payload"."enum__research_downloads_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload"."research_downloads_documents" ADD CONSTRAINT "research_downloads_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."research_downloads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_research_downloads_v_version_documents" ADD CONSTRAINT "_research_downloads_v_version_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_research_downloads_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "research_downloads_documents_order_idx" ON "payload"."research_downloads_documents" USING btree ("_order");
  CREATE INDEX "research_downloads_documents_parent_id_idx" ON "payload"."research_downloads_documents" USING btree ("_parent_id");
  CREATE INDEX "research_downloads__status_idx" ON "payload"."research_downloads" USING btree ("_status");
  CREATE INDEX "_research_downloads_v_version_documents_order_idx" ON "payload"."_research_downloads_v_version_documents" USING btree ("_order");
  CREATE INDEX "_research_downloads_v_version_documents_parent_id_idx" ON "payload"."_research_downloads_v_version_documents" USING btree ("_parent_id");
  CREATE INDEX "_research_downloads_v_version_version__status_idx" ON "payload"."_research_downloads_v" USING btree ("version__status");
  CREATE INDEX "_research_downloads_v_created_at_idx" ON "payload"."_research_downloads_v" USING btree ("created_at");
  CREATE INDEX "_research_downloads_v_updated_at_idx" ON "payload"."_research_downloads_v" USING btree ("updated_at");
  CREATE INDEX "_research_downloads_v_latest_idx" ON "payload"."_research_downloads_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."research_downloads_documents" CASCADE;
  DROP TABLE "payload"."research_downloads" CASCADE;
  DROP TABLE "payload"."_research_downloads_v_version_documents" CASCADE;
  DROP TABLE "payload"."_research_downloads_v" CASCADE;
  ALTER TABLE "payload"."users_sections" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "payload"."enum_users_sections";
  CREATE TYPE "payload"."enum_users_sections" AS ENUM('home/hero', 'home/stats', 'home/achievements', 'home/programs', 'home/why-mlrit', 'home/success-stories', 'home/testimonials', 'home/events', 'home/placements', 'placements/track-record', 'placements/statistics', 'placements/mous', 'placements/support', 'placements/recruiters', 'iqac/aqar', 'iqac/best-practices', 'iqac/functions', 'iqac/objectives', 'iqac/overview', 'iqac/initiatives', 'iqac/support', 'iqac/reports', 'iqac/feedback', 'iqac/contact', 'iqac/nba', 'site/page-headers', 'info/pages', 'site/documents', 'examinations/annual-reports', 'examinations/certificates', 'examinations/circulars', 'examinations/citizen-charter', 'examinations/coe', 'examinations/contact', 'site/footer', 'about/overview', 'about/rankings-awards', 'about/vision-mission', 'academics/overview', 'admissions/b-category', 'admissions/fees', 'admissions/why-mlrit', 'chronicles/overview', 'departments/pg', 'departments/ug', 'examinations/downloads', 'examinations/fee-results', 'examinations/notifications', 'examinations/pyqs', 'examinations/regulations', 'examinations/student-verifications', 'examinations/timetable-external', 'examinations/timetable-internal', 'iqac/composition', 'iqac/naac', 'placements/drives', 'placements/global-certification', 'placements/industry-readiness', 'placements/overview', 'research/support', 'student-life/overview', 'admissions/overview', 'admissions/counselling', 'admissions/support', 'admissions/scholarships', 'admissions/by-degree', 'examinations/syllabus', 'placements/alumni', 'about/internal-governance', 'site/faculty-profile', 'site/research-profile', 'site/syllabus-regulation', 'site/syllabus-semester', 'admissions/policies');
  ALTER TABLE "payload"."users_sections" ALTER COLUMN "value" SET DATA TYPE "payload"."enum_users_sections" USING "value"::"payload"."enum_users_sections";
  DROP TYPE "payload"."enum_research_downloads_status";
  DROP TYPE "payload"."enum__research_downloads_v_version_status";`)
}

