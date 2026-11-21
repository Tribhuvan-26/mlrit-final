import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Puts every banner the homepage carousel shows into the Banners list in the
 * admin, so each can be edited, switched off, scheduled with start and end
 * dates, or deleted there. Until now the bundled ones lived only in the
 * component (components/sections/SuccessStories.tsx) and could not be touched.
 *
 * Banners already saved in the admin keep their place at the front, exactly as
 * the page showed them; a bundled banner is only added when no saved one has
 * the same heading. The migration runs once, so a banner deleted afterwards
 * stays deleted.
 */
const BANNERS = [
  { id: "microsoft-51-lpa", key: "https://i.ibb.co/MxvbKjRH/8.jpg", season: "Placement · 2026", name: "Microsoft — 51 LPA", detail: "Sai Loukhya & Sailatha · CSE" },
  { id: "mrs-vijay-keerthika", key: "https://i.ibb.co/670CTVrD/6.png", season: "Faculty · Cert", name: "Mrs. Vijay Keerthika", detail: "Wipro TalentNext · 87 %" },
  { id: "mlrit-football", key: "https://i.ibb.co/99JB52L2/4.jpg", season: "Sports · 1st Place", name: "MLRIT Football", detail: "vs. St. Peter's · March 21–22" },
  { id: "19-students-at-eidiko", key: "https://i.ibb.co/YFgQdGgx/1.jpg", season: "Placement · 2025", name: "19 Students at Eidiko", detail: "Eidiko Systems · ₹4.70 LPA" },
  { id: "careers360-aaaa", key: "https://i.ibb.co/S4L7YCQY/2.jpg", season: "Recognition", name: "Careers360 AAAA", detail: "Four-A Accredited" },
  { id: "mehta-hitech-industries", key: "https://i.ibb.co/Xf6Vbj44/5.jpg", season: "Placement · 2025", name: "Mehta Hitech Industries", detail: "3 Students · Batch 2025" },
  { id: "iic-7-0-four-star-rating", key: "/success-stories/iic-7-0-four-star-rating.jpg", season: "Recognition · IIC", name: "IIC 7.0 Four-Star Rating", detail: "Institution’s Innovation Council · AY 2024–25" },
  { id: "greenmetric-world-rankings", key: "/success-stories/greenmetric-world-university-rankings-2026.jpg", season: "Ranking · 2026", name: "GreenMetric World Rankings", detail: "World 1341 · India 55" },
  { id: "mechanical-dept-chairman-s-award", key: "/success-stories/mech-sae-india-baja-chairmans-award.jpg", season: "Baja · Award", name: "Mechanical Dept. — Chairman’s Award", detail: "SAE India Chennai Baja Finals · July 2026" },
  { id: "ravi-teja-powerlifting-champion", key: "/success-stories/ravi-teja-powerlifting-national-trials-2026.jpg", season: "Sports · Gold", name: "Ravi Teja — Powerlifting Champion", detail: "1st Place · WPC National Trials 2026" },
  { id: "ravi-teja-at-india-nationals", key: "/success-stories/ravi-teja-wpso-wpc-india-nationals.jpg", season: "Sports · 2026", name: "Ravi Teja at India Nationals", detail: "WPSO & WPC Deadlift Nationals · III Year ECE" },
  { id: "mlrit-football-team", key: "/success-stories/football-vibhava-2026-first-prize.jpg", season: "Sports · 1st Place", name: "MLRIT Football Team", detail: "Vibhava 2026 · VBIT · Sept 28–29" },
  { id: "mlrit-cricket-team", key: "/success-stories/cricket-vibhava-2026-first-prize.jpg", season: "Sports · 1st Place", name: "MLRIT Cricket Team", detail: "Vibhava 2026 · VBIT · Oct 1" },
  { id: "m-devi-prasad", key: "/success-stories/m-devi-prasad-state-athletics-relay.jpg", season: "Sports · 3rd Place", name: "M. Devi Prasad", detail: "4x400m Relay · Telangana State Junior Athletics" },
  { id: "shri-marri-laxman-reddy-garu", key: "/success-stories/mlr-chairman-swimming-championship-medals.jpg", season: "Sports · Medals", name: "Shri Marri Laxman Reddy Garu", detail: "2 Gold · 1 Silver · 1 Bronze · TS Masters Swimming" },
  { id: "mr-m-p-lucky", key: "/success-stories/mp-lucky-pre-republic-day-parade-camp.jpg", season: "NSS · Selection", name: "Mr. M. P. Lucky", detail: "West Zone Pre-Republic Day Parade Camp · IV Year AE" },
  { id: "team-toxic-virtusa-jatayu-s5", key: "/success-stories/virtusa-jatayu-season-5-runner-up.jpg", season: "Competition · Runner-Up", name: "Team TOXIC — Virtusa Jatayu S5", detail: "Runner-up among 100+ finalist teams" },
  { id: "mlrit-at-capgemini-tech4positive", key: "/success-stories/capgemini-tech4positive-hackathon.jpg", season: "Hackathon · 2nd & 3rd", name: "MLRIT at Capgemini Tech4Positive", detail: "II & III Prize · Capgemini, Hyderabad" },
  { id: "iii-year-cse-ai-ml", key: "/success-stories/ai-frontier-hackathon-iare-3rd-prize.jpg", season: "Hackathon · 3rd Prize", name: "III Year CSE (AI & ML)", detail: "AI Frontier Hackathon · IARE" },
  { id: "ece-students-idea-hackathon", key: "/success-stories/ece-idea-hackathon-cbit-2nd-prize.jpg", season: "Hackathon · 2nd Prize", name: "ECE Students — Idea Hackathon", detail: "2nd Runner-up · CBIT College" },
  { id: "ece-at-roboveda-2026", key: "/success-stories/roboveda-hackathon-snist-3rd-prize.jpg", season: "Hackathon · 3rd Prize", name: "ECE at RoboVeda-2026", detail: "3rd Prize · SNIST" },
  { id: "finathon-36-hour-hiring-hackathon", key: "/success-stories/finathon-hiring-hackathon-winners.jpg", season: "Hackathon · Winners", name: "FinaThon 36-Hour Hiring Hackathon", detail: "Organised by CSE–AI&ML, MLRIT" },
  { id: "dr-ajmeera-kiran", key: "/success-stories/dr-ajmeera-kiran-state-best-teacher-award.jpg", season: "Faculty · Award", name: "Dr. Ajmeera Kiran", detail: "State Level Best Teacher · Acharya Ratna Awards 2K26" },
  { id: "dr-d-b-k-kamesh", key: "/success-stories/dr-dbk-kamesh-tmtia-2026-award-of-honour.jpg", season: "Faculty · Award", name: "Dr. D. B. K. Kamesh", detail: "Award of Honour · Mother Teresa Iconic Awards 2026" },
  { id: "mrs-b-manjusha", key: "/success-stories/mrs-b-manjusha-tmtia-2026-award-of-honour.jpg", season: "Faculty · Award", name: "Mrs. B. Manjusha", detail: "Award of Honour · Mother Teresa Iconic Awards 2026" },
  { id: "mr-j-teja-mr-p-sai-kumar", key: "/success-stories/wipro-talentnext-dotnet-faculty-certification.jpg", season: "Faculty · Cert", name: "Mr. J Teja & Mr. P Sai Kumar", detail: "TalentNext Wipro .NET Full Stack · CSE-AI&ML" },
]

const SLUG = 'home-success-stories' as const

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const current = (await payload.findGlobal({ slug: SLUG, depth: 0, overrideAccess: true, req })) as {
    cards?: { name?: string | null }[] | null
  }
  const list = current.cards ?? []
  const have = new Set(list.map((c) => String(c.name ?? '').trim()))
  const fresh = BANNERS.filter((b) => !have.has(b.name)).map(({ id, ...b }) => ({ ...b, active: true, itemId: id }))
  if (!fresh.length) return

  await payload.updateGlobal({
    slug: SLUG,
    data: { cards: [...list, ...fresh], _status: 'published' } as never,
    depth: 0,
    overrideAccess: true,
    req,
  })
  payload.logger.info(`banners: added ${fresh.length} to the existing ${list.length}`)
}

// The banners are ordinary CMS content from here on; nothing to undo.
export async function down(_: MigrateDownArgs): Promise<void> {}
