const CANONICAL_HOST = "easytarget.com.ua";
const WWW_HOST = "www.easytarget.com.ua";
const REDIRECT_STATUS = 301;

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

  return context.next();
}
