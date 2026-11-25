const CANONICAL_HOST = "easytarget.com.ua";
const WWW_HOST = "www.easytarget.com.ua";
const REDIRECT_STATUS = 301;
// Product pages of the previous site no longer exist. 410 tells crawlers to drop them.
const GONE_PATH_PREFIX = "/tproduct/";

function goneResponse() {
  return new Response("410 Gone", {
    status: 410,
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "text/plain; charset=UTF-8",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex",
    },
  });
}

function getRequestHost(request) {
  const hostHeader = request.headers.get("host") || "";
  return hostHeader.split(":")[0].toLowerCase();
}

function buildCanonicalUrl(request) {
  const url = new URL(request.url);
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  return url;
}

export async function onRequest(context) {
  const host = getRequestHost(context.request);
  if (host === WWW_HOST) {
    return Response.redirect(buildCanonicalUrl(context.request).toString(), REDIRECT_STATUS);
  }

  if (new URL(context.request.url).pathname.startsWith(GONE_PATH_PREFIX)) {
    return goneResponse();
  }

  return context.next();
}
