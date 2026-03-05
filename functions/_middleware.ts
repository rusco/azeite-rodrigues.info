// /functions/_middleware.ts
export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const host = url.hostname;

  if (host === "shop.azeite-rodrigues.info") {
    // Serve /shop.html for the root path on the shop subdomain
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return ctx.env.ASSETS.fetch(
        new Request(new URL("/shop.html", url.origin), ctx.request)
      );
    }

    // (Optional) SPA-style: always serve /shop.html for ANY path on shop.
    // return ctx.env.ASSETS.fetch(
    //   new Request(new URL("/shop.html", url.origin), ctx.request)
    // );
  }

  // All other hostnames fall through to normal handling
  return ctx.next();
};