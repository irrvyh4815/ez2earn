const {
  assertRemoteSyncEnabled,
  getRequestUrl,
  readJsonBody,
  sendJson,
  supabaseFetch
} = require("./_supabase");

function encodeEq(value) {
  return encodeURIComponent(value);
}

module.exports = async function handler(req, res) {
  try {
    assertRemoteSyncEnabled();

    if (req.method === "GET") {
      const url = getRequestUrl(req);
      const memberCode = url.searchParams.get("memberCode");
      if (!memberCode) return sendJson(res, 400, { ok: false, error: "memberCode is required." });

      const rows = await supabaseFetch(
        `user_vaults?member_code=eq.${encodeEq(memberCode)}&select=member_code,encrypted_payload,updated_at`
      );
      return sendJson(res, 200, { ok: true, vault: rows[0] || null });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = await readJsonBody(req);
      if (!body.memberCode || !body.encryptedPayload) {
        return sendJson(res, 400, { ok: false, error: "memberCode and encryptedPayload are required." });
      }

      const rows = await supabaseFetch("user_vaults?on_conflict=member_code", {
        method: "POST",
        prefer: "resolution=merge-duplicates,return=representation",
        body: {
          member_code: body.memberCode,
          encrypted_payload: body.encryptedPayload,
          updated_at: new Date().toISOString()
        }
      });
      return sendJson(res, 200, { ok: true, vault: rows[0] || null });
    }

    res.setHeader("Allow", "GET, POST, PUT");
    return sendJson(res, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      ok: false,
      error: error.message,
      details: error.data || null
    });
  }
};
