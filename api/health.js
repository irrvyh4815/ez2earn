const { isRemoteSyncEnabled, isSupabaseConfigured, sendJson } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { ok: false, error: "Method not allowed." });
  }

  return sendJson(res, 200, {
    ok: true,
    backend: "supabase",
    configured: isSupabaseConfigured(),
    remoteSyncEnabled: isRemoteSyncEnabled(),
    time: new Date().toISOString()
  });
};
