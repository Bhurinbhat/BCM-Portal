// Thin loader: the trending logic lives in lib/trending.mjs, which the build copies to the
// static site. Loading it at runtime from this same deployment means changes to the logic
// ship with a normal GitHub push and build, without re-uploading this function.
let core;
export default async function handler(req, res) {
  try {
    if (!core) {
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const r = await fetch(`https://${host}/lib/trending.mjs`, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw new Error(`core ${r.status}`);
      const code = await r.text();
      core = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
    }
    return await core.default(req, res);
  } catch (e) {
    core = null;
    res.status(502).json({ error: String((e && e.message) || e) });
  }
}
