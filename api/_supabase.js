const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REMOTE_SYNC_ENABLED = process.env.EZ2EARN_ENABLE_REMOTE_SYNC === "true";

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function isRemoteSyncEnabled() {
  return REMOTE_SYNC_ENABLED;
}

function assertRemoteSyncEnabled() {
  if (!isRemoteSyncEnabled()) {
    const error = new Error("Remote sync is disabled.");
    error.statusCode = 403;
    throw error;
  }
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function getRequestUrl(req) {
  const host = req.headers.host || "localhost";
  return new URL(req.url, `https://${host}`);
}

async function supabaseFetch(path, options = {}) {
  if (!isSupabaseConfigured()) {
    const error = new Error("Supabase environment variables are not configured.");
    error.statusCode = 503;
    throw error;
  }

  const url = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/${path.replace(/^\/+/, "")}`;
  const response = await fetch(url, {
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const error = new Error("Supabase request failed.");
    error.statusCode = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

module.exports = {
  assertRemoteSyncEnabled,
  getRequestUrl,
  isRemoteSyncEnabled,
  isSupabaseConfigured,
  readJsonBody,
  sendJson,
  supabaseFetch
};
