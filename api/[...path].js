let backendHandlerPromise;

function restoreOriginalApiUrl(req) {
  const currentUrl = new URL(req.url || "/", "http://vercel.local");
  const apiPath = currentUrl.searchParams.get("__path");

  if (apiPath === null) {
    return;
  }

  currentUrl.searchParams.delete("__path");
  const query = currentUrl.searchParams.toString();
  req.url = `/api/${apiPath}${query ? `?${query}` : ""}`;
}

export default async function handler(req, res) {
  backendHandlerPromise ??= import("../artifacts/api-server/dist/vercel.mjs").then(
    (mod) => mod.default,
  );

  restoreOriginalApiUrl(req);
  const backendHandler = await backendHandlerPromise;
  return backendHandler(req, res);
}
