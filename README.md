# SCG BCM Portal

Portal for SCG's Corporate BCM Office. It shows current disaster news across Southeast Asia next to the BCM readiness of 147 SCG companies and sites, and hands events off to the Early Warning System (EWS) and Crisis Hub.

## What's in this repo

| Path | Purpose |
|---|---|
| `index.html` | The whole front end: sign in / sign up, home page (short hero with 4 key numbers, situation map, hazard news with hover details and detail pages, live feed), Readiness Dashboard split into sections, ICS key-contacts chart, news pages, Thai/English language menu |
| `config.js` | Public runtime config: Supabase URL, publishable key, live-feed endpoint |
| `api/trending.js` | Vercel function. Trending war/conflict, cyber-threat and disaster news from Google News search (English and Thai), The Hacker News, BleepingComputer and the CISA Known Exploited Vulnerabilities catalog. Groups the same story from many outlets, tags ASEAN relevance and topics, counts trending terms. Cached 5 minutes |
| `api/hazards.js` | Vercel function. Pulls GDACS alerts and USGS M4.5+ earthquakes from the last 21 days, filtered to Southeast Asia, cached 15 minutes |
| `assets/scg-logo.png` | SCG logo (transparent PNG, 120 px high) used on the login pages, side menu, top bar and as the favicon |
| `data/` | Source data: `companies.json` (from BCM_Dashboard_2026.xlsx, as of 23 Sep 2026) and `hazards.json` (curated news, 21 Oct 2026) |
| `supabase/` | Table definitions and seed data |
| `legacy/` | The previous React/Netlify version of the portal, kept unchanged |

## Readiness Dashboard sections

The dashboard opens on a grid of section cards. Each card opens one section, and the tabs above switch between them. Each section has its own link:

| Section | Link |
|---|---|
| Readiness overview | `#rd-overview` |
| By BU | `#rd-bu` |
| Components | `#rd-comp` |
| Gaps & plan | `#rd-plan` |
| By country | `#rd-geo` |
| Companies | `#rd-list` |

Bar charts, pie charts, heatmaps and the map highlight the item under the mouse, dim the rest and show its numbers.

## Real-time updates

The page refreshes its data every 5 minutes while it is open (and again when the tab comes back into view), without reloading the page:

- `/api/trending` feeds the **Trending** section on the home page (War & conflict, Cyber Threat) and the news page tabs `#news-conflict`, `#news-cyber`, `#news-disaster`. Each story opens a detail panel with tags, other outlets reporting it, related stories and a link to the original article. Trending terms come with a 24-hour volume chart; clicking a term filters the list.
- `/api/hazards` (GDACS, USGS) is turned into hazard cards automatically. An event becomes a card when it is Orange/Red, an earthquake of M6+, or has SCG sites within its radius (earthquake 90–350 km by magnitude, cyclone 300 km, flood 160 km, other 100 km). Sites in that radius are listed with their ERP readiness.
- Disaster stories in ASEAN media (Thai and English) also become hazard cards when they carry a warning/evacuation signal or are reported by 3+ outlets in the last 48 hours. These cards have no map zone or site list; they link to every outlet that reported the story.
- Curated hazard news from Supabase (`portal_hazards`) is shown for 7 days after `published_at`, then gives way to the live events. If no live event qualifies, the latest curated items stay on screen.

Headlines are shown in the language of the source; the TH/EN switch does not translate them.

## ICS key contacts (ผัง ICS ผู้รับผิดชอบ)

Sidebar menu "ผัง ICS ผู้รับผิดชอบ" (`#ics`, or `#ics-SCGP` for one BU) shows who is responsible during an incident:

- Corporate level: CMC Chair and Corporate BCM Office.
- Each BU (SCGC, SCGP, CGS, SL, SCGD, D&R, CBM): an ICS chart with the Incident Commander, Command Staff (Safety, Liaison, Public Information) and General Staff (Operations, Planning, Logistics, Finance/Admin), plus the BU BCM Coordinator.
- Each site from `portal_companies`: Site Incident Commander (LMT leader), ERT Leader and Site BCM Coordinator. Click a site for its own chart, the event affecting it and who it reports to.
- Events with affected sites appear as filters at the top, and sites in hazard areas are listed first. A hazard's detail page has a button that opens the ICS chart filtered to its sites.

Names and phone numbers come from the Supabase table `portal_ics_contacts`. Only signed-in users can read it (RLS: `select` for `authenticated` only; the public key has no access), so names show only after Sign in with Microsoft is turned on. Until then the page shows the structure with "รอระบุชื่อ" in each slot.

Fill the table in the Supabase Table Editor, one row per person:

| Column | Value |
|---|---|
| `bu` | `SCG` for corporate roles, otherwise the BU code as in `portal_companies.bu` |
| `site_name` | empty for BU-level roles; for site roles, exactly `portal_companies.name` |
| `role` | `cmc_chair`, `corp_bcm` (corporate) · `ic`, `safety`, `liaison`, `pio`, `ops`, `plan`, `log`, `fin`, `bcm_co` (BU) · `site_ic`, `ert`, `site_bcm` (site) |
| `person_name`, `position`, `phone`, `email`, `backup_name`, `backup_phone` | contact details |

Each (bu, site_name, role) slot can have one row.

## Language

The TH/EN button in the top bar (and on the login page) switches the whole portal between Thai and English. The choice is kept in the browser (`localStorage` key `bcm-lang`). Translations live in the `I18N` object in `index.html`; hazard news has its own English text in `HAZ_EN`. A new Thai string added to the page needs a matching entry in `I18N`, otherwise it stays in Thai in English mode.

## Linked systems

| App | URL |
|---|---|
| Crisis Hub | https://crisis-task-hub-pilot.vercel.app/login |
| Early Warning System (EWS) | https://bcm.scg.com/view/application/EWS_Early_Warning_System_A00/page/Copy_of_1_1_Home_Page_A00 |
| Intelligent Map | https://bcm.scg.com/view/application/Water_Dashboard_A00 |

Links live in the `LINKS` object in `index.html` and open in a new tab.

## Sign in, sign up and password reset

The login page follows the shadcn `Login04` and `SignupForm` components (Sign in with Microsoft, email and password, sign-up with a BCM role, forgot password), rebuilt in plain HTML/CSS because this portal has no React build step. To move to Next.js + shadcn later: `npx create-next-app@latest --ts --tailwind`, `npx shadcn@latest init`, `npx shadcn@latest add button card checkbox input label select separator`, then place the component in `components/ui/` (the `@/components/ui/...` imports in shadcn components expect that folder).

Email and password use Supabase Auth when `emailLogin: true` in `config.js` (sign-up stores first name, last name, username and BCM role in `user_metadata`). Supabase's built-in mailer only delivers to project team members, so set up custom SMTP in Supabase before opening sign-up to staff. While `emailLogin` is false the forms run in demo mode and passwords are never sent or stored.

### Sign in with Microsoft

The login page uses Supabase Auth with the Azure (Microsoft Entra ID) provider. To turn it on:

1. In Microsoft Entra ID, register an app (single tenant, SCG). Add the redirect URI `https://hhdwvmpquojqkmjsjevk.supabase.co/auth/v1/callback` and create a client secret.
2. In Supabase → Authentication → Providers → Azure, enter the Application (client) ID, the secret, and the tenant URL `https://login.microsoftonline.com/<tenant-id>`.
3. In Supabase → Authentication → URL Configuration, add the portal URL (for example `https://bcm-portal-seven.vercel.app`) to Redirect URLs.
4. Set `msLogin: true` in `config.js` and redeploy.

Until then the button runs in demo mode and signs in without Microsoft.

## Data flow

1. The page renders immediately from the data embedded in `index.html`.
2. It then reads `portal_companies` and `portal_hazards` from Supabase. If that works, those rows replace the embedded data, so the BCM team can update readiness or hazard news in Supabase without redeploying.
3. It calls `/api/hazards` for the live GDACS/USGS feed. Those events appear in the Live Feed card and as diamond markers on the map.
4. EWS, Crisis Hub and Intelligent Map are separate systems; the portal links to them (see Linked systems). `portal_incidents` is kept from the earlier prototype.

## Supabase tables (project `bcm-readiness-hub`)

- `portal_companies`: one row per company/site. `status_code` has 20 characters, one per BCM component in Dashboard order: `1` done, `0` missing, `p` pending, `n` n/a, `A`–`L` planned month (Jan–Dec).
- `portal_hazards`: hazard news cards. Set `active = false` to hide an item. `site_names` must match `portal_companies.name`.
- `portal_incidents`: incidents from Crisis Hub (insert only for the public key).

## Updating hazard news

Add or edit a row in `portal_hazards` (Supabase Table Editor). Fields: `severity` (`em`, `wa`, `wt`, `ad`), `zone_lat`/`zone_lon`/`zone_km` for the map circle, `erp_index` (12 = ERP Flood, 13 = Cyber, 14 = Earthquake, 17 = Other), `facts` as `[["label","value","note"], ...]`, `sources` as `[{"name","url","date"}]`.

## Notes

- Site positions on the map are approximate (province level). The workbook has no coordinates.
- BU status thresholds (On Track ≥ 85%, Behind 60–84%, Critical < 60%) are prototype defaults.
- Sign in with Microsoft runs in demo mode until the steps above are done.
