import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."admissions_support" ALTER COLUMN "contact" SET DEFAULT 'Contact No';
  ALTER TABLE "payload"."admissions_support" ALTER COLUMN "email" SET DEFAULT 'Email ID';
  ALTER TABLE "payload"."_admissions_support_v" ALTER COLUMN "version_contact" SET DEFAULT 'Contact No';
  ALTER TABLE "payload"."_admissions_support_v" ALTER COLUMN "version_email" SET DEFAULT 'Email ID';
  ALTER TABLE "payload"."home_success_stories_cards" ADD COLUMN "active" boolean DEFAULT true;
  ALTER TABLE "payload"."home_success_stories_cards" ADD COLUMN "start_date" varchar;
  ALTER TABLE "payload"."home_success_stories_cards" ADD COLUMN "end_date" varchar;
  ALTER TABLE "payload"."_home_success_stories_v_version_cards" ADD COLUMN "active" boolean DEFAULT true;
  ALTER TABLE "payload"."_home_success_stories_v_version_cards" ADD COLUMN "start_date" varchar;
  ALTER TABLE "payload"."_home_success_stories_v_version_cards" ADD COLUMN "end_date" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."admissions_support" ALTER COLUMN "contact" SET DEFAULT 'Contact';
  ALTER TABLE "payload"."admissions_support" ALTER COLUMN "email" SET DEFAULT 'Email';
  ALTER TABLE "payload"."_admissions_support_v" ALTER COLUMN "version_contact" SET DEFAULT 'Contact';
  ALTER TABLE "payload"."_admissions_support_v" ALTER COLUMN "version_email" SET DEFAULT 'Email';
  ALTER TABLE "payload"."home_success_stories_cards" DROP COLUMN "active";
  ALTER TABLE "payload"."home_success_stories_cards" DROP COLUMN "start_date";
  ALTER TABLE "payload"."home_success_stories_cards" DROP COLUMN "end_date";
  ALTER TABLE "payload"."_home_success_stories_v_version_cards" DROP COLUMN "active";
  ALTER TABLE "payload"."_home_success_stories_v_version_cards" DROP COLUMN "start_date";
  ALTER TABLE "payload"."_home_success_stories_v_version_cards" DROP COLUMN "end_date";`)
}

