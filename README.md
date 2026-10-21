# SCG BCM Portal

Portal for SCG's Corporate BCM Office. It shows current disaster news across Southeast Asia next to the BCM readiness of 147 SCG companies and sites, and hands events off to the Early Warning System (EWS) and Crisis Hub.

## What's in this repo

| Path | Purpose |
|---|---|
| `index.html` | The whole front end: Sign in with Microsoft, landing page (situation map, hazard news with hover details and detail pages, live feed), Readiness Dashboard, news pages |
| `config.js` | Public runtime config: Supabase URL, publishable key, live-feed endpoint |
| `api/hazards.js` | Vercel function. Pulls GDACS alerts and USGS M4.5+ earthquakes from the last 21 days, filtered to Southeast Asia, cached 15 minutes |
| `assets/scg-logo.png` | SCG logo (transparent PNG, 120 px high) used on the login pages, side menu, top bar and as the favicon |
| `data/` | Source data: `companies.json` (from BCM_Dashboard_2026.xlsx, as of 23 Sep 2026) and `hazards.json` (curated news, 21 Oct 2026) |
| `supabase/` | Table definitions and seed data |
| `legacy/` | The previous React/Netlify version of the portal, kept unchanged |

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
