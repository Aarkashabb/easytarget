const CALLBACK_PATH = "/bing-oauth/callback";

function securityHeaders() {
  return {
    "cache-control": "no-store, max-age=0",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
    "content-type": "text/html; charset=UTF-8",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  };
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const isOAuthReturn = url.searchParams.has("code") || url.searchParams.has("error");
  const title = isOAuthReturn ? "OAuth callback received" : "EasyTarget OAuth callback";
  const message = isOAuthReturn
    ? "OAuth authorization has returned to the registered EasyTarget callback. This endpoint is reserved for the secure Bing integration flow."
    : "This is the registered callback URL for the EasyTarget Bing Webmaster integration.";

  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body><p>${message}</p><p>Path: ${CALLBACK_PATH}</p></body></html>`,
    { headers: securityHeaders() },
  );
}
