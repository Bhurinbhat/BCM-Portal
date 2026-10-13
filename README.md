# SCG BCM Portal

Portal for SCG's Corporate BCM Office. It shows current disaster news across Southeast Asia next to the BCM readiness of 147 SCG companies and sites, and hands events off to the Early Warning System (EWS) and Crisis Hub.

## What's in this repo

| Path | Purpose |
|---|---|
| `index.html` | The whole front end: SSO login, landing page (situation map, hazard news with hover details, live feed), Readiness Dashboard, EWS and Crisis Hub screens |
| `config.js` | Public runtime config: Supabase URL, publishable key, live-feed endpoint |
| `api/hazards.js` | Vercel function. Pulls GDACS alerts and USGS M4.5+ earthquakes from the last 21 days, filtered to Southeast Asia, cached 15 minutes |
| `assets/scg-logo.svg` | Logo slot. **Replace this placeholder with the official SCG logo file from SCG Brand Center** (keep the file name, or update the `src` in `index.html`) |
| `data/` | Source data: `companies.json` (from BCM_Dashboard_2026.xlsx, as of 23 Sep 2026) and `hazards.json` (curated news, 13 Oct 2026) |
| `supabase/` | Table definitions and seed data |
| `legacy/` | The previous React/Netlify version of the portal, kept unchanged |

## Data flow

1. The page renders immediately from the data embedded in `index.html`.
2. It then reads `portal_companies` and `portal_hazards` from Supabase. If that works, those rows replace the embedded data, so the BCM team can update readiness or hazard news in Supabase without redeploying.
3. It calls `/api/hazards` for the live GDACS/USGS feed. Those events appear in the Live Feed card and as diamond markers on the map.
4. Creating an incident in Crisis Hub inserts a row into `portal_incidents`.

## Supabase tables (project `bcm-readiness-hub`)

- `portal_companies`: one row per company/site. `status_code` has 20 characters, one per BCM component in Dashboard order: `1` done, `0` missing, `p` pending, `n` n/a, `A`–`L` planned month (Jan–Dec).
- `portal_hazards`: hazard news cards. Set `active = false` to hide an item. `site_names` must match `portal_companies.name`.
- `portal_incidents`: incidents from Crisis Hub (insert only for the public key).

## Updating hazard news

Add or edit a row in `portal_hazards` (Supabase Table Editor). Fields: `severity` (`em`, `wa`, `wt`, `ad`), `zone_lat`/`zone_lon`/`zone_km` for the map circle, `erp_index` (12 = ERP Flood, 13 = Cyber, 14 = Earthquake, 17 = Other), `facts` as `[["label","value","note"], ...]`, `sources` as `[{"name","url","date"}]`.

## Notes

- Site positions on the map are approximate (province level). The workbook has no coordinates.
- BU status thresholds (On Track ≥ 85%, Behind 60–84%, Critical < 60%) are prototype defaults.
- SSO is simulated. Connect Microsoft Entra ID (or Supabase Auth with Azure) before real use.
