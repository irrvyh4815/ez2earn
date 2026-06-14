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
      const select = "invoice_id,owner_member_code,access_list,encrypted_payload,metadata,updated_at";
      const path = memberCode
        ? `invoice_documents?or=(owner_member_code.eq.${encodeEq(memberCode)},access_list.cs.%5B%7B%22memberCode%22%3A%22${encodeEq(memberCode)}%22%7D%5D)&select=${select}`
        : `invoice_documents?select=${select}`;
      const rows = await supabaseFetch(path);
      return sendJson(res, 200, { ok: true, invoices: rows });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = await readJsonBody(req);
      if (!body.invoiceId || !body.ownerMemberCode || !body.encryptedPayload) {
        return sendJson(res, 400, {
          ok: false,
          error: "invoiceId, ownerMemberCode and encryptedPayload are required."
        });
      }

      const rows = await supabaseFetch("invoice_documents?on_conflict=invoice_id", {
        method: "POST",
        prefer: "resolution=merge-duplicates,return=representation",
        body: {
          invoice_id: body.invoiceId,
          owner_member_code: body.ownerMemberCode,
          access_list: body.accessList || [],
          encrypted_payload: body.encryptedPayload,
          metadata: body.metadata || {},
          updated_at: new Date().toISOString()
        }
      });
      return sendJson(res, 200, { ok: true, invoice: rows[0] || null });
    }

    if (req.method === "DELETE") {
      const url = getRequestUrl(req);
      const invoiceId = url.searchParams.get("invoiceId");
      if (!invoiceId) return sendJson(res, 400, { ok: false, error: "invoiceId is required." });

      await supabaseFetch(`invoice_documents?invoice_id=eq.${encodeEq(invoiceId)}`, {
        method: "DELETE"
      });
      return sendJson(res, 200, { ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return sendJson(res, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      ok: false,
      error: error.message,
      details: error.data || null
    });
  }
};
