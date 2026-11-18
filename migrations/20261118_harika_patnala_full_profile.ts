import { randomUUID } from 'node:crypto'

import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Upserts the full profile for Dr. Harika Patnala (slug: harika-patnala-hs)
 * into the Payload faculty collection. The seed migration created a minimal
 * stub from the spreadsheet; this migration replaces it with every field from
 * her December 2025 resume.
 *
 * Uses ON CONFLICT DO UPDATE so the migration is idempotent and safe to
 * re-run. All list tables (qualifications, specialization, subjectsTaught,
 * publications) are cleared then re-inserted to avoid duplicates on re-runs.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  const SLUG = 'harika-patnala-hs'

  // ── 1. Upsert the main faculty row ────────────────────────────────────────
  const res = await db.execute(sql`
    INSERT INTO "payload"."faculty" (
      "name", "designation", "department", "is_hod",
      "photo", "image_alt",
      "experience", "description", "email",
      "profile_links_linkedin", "profile_links_google_scholar",
      "profile_links_scopus", "profile_links_orcid",
      "emp_id", "order", "slug"
    )
    VALUES (
      ${'Dr. Harika Patnala'},
      ${'Associate Professor'},
      ${'hs'},
      ${false},
      ${'/faculty-new/hs/hs-harika-patnala.jpg'},
      ${'Portrait of Dr. Harika Patnala'},
      ${'16 years 6 months'},
      ${'Dr. Harika Patnala is an Associate Professor in the Department of Humanities and Sciences (Chemistry) at MLR Institute of Technology, Hyderabad, with over 16 years of teaching experience. She completed her PhD in Chemistry from Jawaharlal Nehru Technological University, Kakinada in 2023. Prior to joining MLRIT in June 2022, she served as an Assistant Professor at Andhra Loyola Institute of Engineering and Technology, Vijayawada (November 2011–May 2022) and as a Lecturer at K.B.N. College, Vijayawada (June 2009–November 2011). Her research interests include the evaluation of nutrients and non-nutritive contents of herbal formulations and the synthesis of aminophosphates. She has published 12 research papers in reputed national and international journals. She is GATE qualified (March 2009) and APSET qualified (February 2015). She currently serves as Engineers Without Borders Club Coordinator, IQAC Faculty Coordinator and JNTU Faculty Coordinator at MLRIT.'},
      ${'patnalaharika@gmail.com'},
      ${null},
      ${null},
      ${'https://www.scopus.com/authid/detail.uri?authorId=56989853800'},
      ${'https://orcid.org/0000-0002-8239-479X'},
      ${'1768'},
      ${200},
      ${SLUG}
    )
    ON CONFLICT ("slug") DO UPDATE SET
      "name"                         = EXCLUDED."name",
      "designation"                  = EXCLUDED."designation",
      "department"                   = EXCLUDED."department",
      "is_hod"                       = EXCLUDED."is_hod",
      "photo"                        = EXCLUDED."photo",
      "image_alt"                    = EXCLUDED."image_alt",
      "experience"                   = EXCLUDED."experience",
      "description"                  = EXCLUDED."description",
      "email"                        = EXCLUDED."email",
      "profile_links_linkedin"       = EXCLUDED."profile_links_linkedin",
      "profile_links_google_scholar" = EXCLUDED."profile_links_google_scholar",
      "profile_links_scopus"         = EXCLUDED."profile_links_scopus",
      "profile_links_orcid"          = EXCLUDED."profile_links_orcid",
      "emp_id"                       = EXCLUDED."emp_id",
      "order"                        = EXCLUDED."order"
    RETURNING "id"
  `)

  const parentId = (res.rows[0] as { id: number }).id
  payload.logger.info(`harika-patnala-hs: upserted faculty row id=${parentId}`)

  // ── 2. Helper: clear and re-insert a list table ───────────────────────────
  const repopulate = async (table: string, items: string[]) => {
    await db.execute(
      sql`DELETE FROM ${sql.raw(`"payload"."${table}"`)} WHERE "_parent_id" = ${parentId}`
    )
    if (!items.length) return
    const values = items.map((v, i) =>
      sql`(${i + 1}, ${parentId}, ${randomUUID()}, ${v})`
    )
    await db.execute(sql`
      INSERT INTO ${sql.raw(`"payload"."${table}"`)} ("_order", "_parent_id", "id", "value")
      VALUES ${sql.join(values, sql`, `)}
    `)
  }

  // ── 3. Qualifications ─────────────────────────────────────────────────────
  await repopulate('faculty_qualifications', [
    'PhD — Chemistry | Jawaharlal Nehru Technological University, Kakinada (2023)',
    'MSc — Organic Chemistry | Acharya Nagarjuna University, Guntur (2006–2008) — 67%',
    'BSc — Mathematics, Physics, Chemistry | Acharya Nagarjuna University, Guntur (2003–2006) — 87%',
  ])

  // ── 4. Specialization ─────────────────────────────────────────────────────
  await repopulate('faculty_specialization', [
    'Evaluation of nutrients and non-nutritive contents of herbal formulations',
    'Synthesis of aminophosphates',
  ])

  // ── 5. Subjects taught ────────────────────────────────────────────────────
  await repopulate('faculty_subjects_taught', [
    'Applied Chemistry',
    'Engineering Chemistry',
    'Environmental Sciences',
    'Spectroscopy',
    'Physical Chemistry',
    'Inorganic Chemistry',
  ])

  // ── 6. Publications (all 12) ──────────────────────────────────────────────
  await repopulate('faculty_publications', [
    '"Synthesis of Pyrimidine-Based Analogues: A Comprehensive Review" — Journal of Chemical Reviews, Vol. 7(4), 2025, pp. 591–633.',
    '"Murraya Leaf and Moringa seed oils by I silico and Ex-vivo" — Plasma Science and Technology, Vol. 25(1), 2024, pp. 109–127.',
    '"Molecular docking study, and ADMET analysis for the synthesized novel Zn (II) complexes as potential SARS-CoV-2 inhibitors" — Trukish Computational and Theoretical Chemistry, Vol. 8(3), 2024, pp. 122–128.',
    '"Nonlinear optical coefficient of Samarium-activated lithium zinc borate glasses in femtosecond and nanosecond regimes" — Optics and Laser Technology, Vol. 168 (2024), 109859.',
    '"Annealing and intensity dependent femtosecond nonlinear optical studies of sodium zinc borate oxide glasses incorporated with gold nanoparticles" — Journal of Non-Crystalline Solids, 617 (2023), 122484.',
    '"Evaluation of nutritive, non-nutritive contents and antioxidant activity of polyherbal formulations" — Current Trends in Biotechnology and Pharmacy, Vol. 15(2), pp. 124–132, April 2021. ISSN 0973-8916 (Print), 2230-7303 (Online). DOI: 10.5530/ctbp.2021.2.14.',
    '"Comparative analysis of nutritive and non-nutritive content of Shatavari – A commercial Indian herbal medicine" — Journal of the Indian Chemical Society, Vol. 97, No. 11a, November 2020, pp. 2329–2335.',
    '"Polyethylene glycol (PEG-400): An efficient one-pot green synthesis and anti-viral activity of novel α-diaminophosphonates" — Phosphorus, Sulfur, and Silicon and the Related Elements, Taylor and Francis, 13 April 2019.',
    '"Effect of solvent composition on total phenol and flavonoids content of Withania somnifera" — Journal of Chemical and Pharmaceutical Sciences, Vol. 10, Issue 1, March 2017, pp. 601–603.',
    '"Green Synthesis and Antiviral Activity of triarylmethane derivatives via Friedel-Craft Alkylation by Polyethylene Glycol (PEG-400)" — Asian Journal of Chemistry, Vol. 28, Issue 3, 2016, pp. 473–478.',
    '"Design, Green Synthesis, Anti-Microbial and Anti-Oxidant Activities of Novel α-Aminophosphonates Via Kabachnik-Fields Reaction" — Phosphorus, Sulfur, and Silicon and the Related Elements, Taylor and Francis, June 2016.',
    '"An efficient green synthesis of novel α-diaminophosphonates" — Phosphorus, Sulfur, and Silicon and the Related Elements, Taylor and Francis, 18 April 2015.',
  ])

  payload.logger.info('harika-patnala-hs: full profile upserted successfully')
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Intentionally left empty: reverting a profile update is not meaningful.
  // To roll back, re-run with a migration that sets the previous values.
}
