import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_faculty_department" AS ENUM('cse', 'cse-ds', 'aiml', 'csit', 'it', 'ece', 'eee', 'mechanical', 'aeronautical', 'mba', 'hs');
  CREATE TABLE "payload"."faculty_qualifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."faculty_specialization" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."faculty_subjects_taught" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."faculty_publications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."faculty_patents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."faculty_books" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."faculty" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"designation" varchar NOT NULL,
  	"department" "payload"."enum_faculty_department" NOT NULL,
  	"is_hod" boolean DEFAULT false,
  	"hod_message" varchar,
  	"photo" varchar,
  	"image_alt" varchar,
  	"experience" varchar,
  	"description" varchar,
  	"email" varchar,
  	"profile_links_linkedin" varchar,
  	"profile_links_google_scholar" varchar,
  	"profile_links_scopus" varchar,
  	"profile_links_orcid" varchar,
  	"emp_id" varchar,
  	"order" numeric DEFAULT 1000,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "faculty_id" integer;
  ALTER TABLE "payload"."faculty_qualifications" ADD CONSTRAINT "faculty_qualifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."faculty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."faculty_specialization" ADD CONSTRAINT "faculty_specialization_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."faculty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."faculty_subjects_taught" ADD CONSTRAINT "faculty_subjects_taught_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."faculty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."faculty_publications" ADD CONSTRAINT "faculty_publications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."faculty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."faculty_patents" ADD CONSTRAINT "faculty_patents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."faculty"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."faculty_books" ADD CONSTRAINT "faculty_books_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."faculty"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "faculty_qualifications_order_idx" ON "payload"."faculty_qualifications" USING btree ("_order");
  CREATE INDEX "faculty_qualifications_parent_id_idx" ON "payload"."faculty_qualifications" USING btree ("_parent_id");
  CREATE INDEX "faculty_specialization_order_idx" ON "payload"."faculty_specialization" USING btree ("_order");
  CREATE INDEX "faculty_specialization_parent_id_idx" ON "payload"."faculty_specialization" USING btree ("_parent_id");
  CREATE INDEX "faculty_subjects_taught_order_idx" ON "payload"."faculty_subjects_taught" USING btree ("_order");
  CREATE INDEX "faculty_subjects_taught_parent_id_idx" ON "payload"."faculty_subjects_taught" USING btree ("_parent_id");
  CREATE INDEX "faculty_publications_order_idx" ON "payload"."faculty_publications" USING btree ("_order");
  CREATE INDEX "faculty_publications_parent_id_idx" ON "payload"."faculty_publications" USING btree ("_parent_id");
  CREATE INDEX "faculty_patents_order_idx" ON "payload"."faculty_patents" USING btree ("_order");
  CREATE INDEX "faculty_patents_parent_id_idx" ON "payload"."faculty_patents" USING btree ("_parent_id");
  CREATE INDEX "faculty_books_order_idx" ON "payload"."faculty_books" USING btree ("_order");
  CREATE INDEX "faculty_books_parent_id_idx" ON "payload"."faculty_books" USING btree ("_parent_id");
  CREATE INDEX "faculty_department_idx" ON "payload"."faculty" USING btree ("department");
  CREATE UNIQUE INDEX "faculty_slug_idx" ON "payload"."faculty" USING btree ("slug");
  CREATE INDEX "faculty_updated_at_idx" ON "payload"."faculty" USING btree ("updated_at");
  CREATE INDEX "faculty_created_at_idx" ON "payload"."faculty" USING btree ("created_at");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faculty_fk" FOREIGN KEY ("faculty_id") REFERENCES "payload"."faculty"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_faculty_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("faculty_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."faculty_qualifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."faculty_specialization" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."faculty_subjects_taught" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."faculty_publications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."faculty_patents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."faculty_books" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."faculty" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."faculty_qualifications" CASCADE;
  DROP TABLE "payload"."faculty_specialization" CASCADE;
  DROP TABLE "payload"."faculty_subjects_taught" CASCADE;
  DROP TABLE "payload"."faculty_publications" CASCADE;
  DROP TABLE "payload"."faculty_patents" CASCADE;
  DROP TABLE "payload"."faculty_books" CASCADE;
  DROP TABLE "payload"."faculty" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_faculty_fk";
  
  DROP INDEX "payload"."payload_locked_documents_rels_faculty_id_idx";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "faculty_id";
  DROP TYPE "payload"."enum_faculty_department";`)
}
