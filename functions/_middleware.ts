// /functions/_middleware.ts
export const onRequest: PagesFunction = async (ctx) => {
    const url = new URL(ctx.request.url);
    const host = url.hostname;

    if (host === "shop.azeite-rodrigues.info") {
        // Only rewrite the root requests on the shop subdomain
        if (url.pathname === "/" || url.pathname === "/index.html") {
            // 1) Try to fetch /shop.html from the static assets
            let res = await ctx.env.ASSETS.fetch(
                new Request(new URL("/shop.html", url.origin), ctx.request)
            );

            // 2) If the asset pipeline returns a redirect (clean-URL behavior),
            //    follow it internally and return the final content as 200.
            if (res.status >= 300 && res.status < 400) {
                const loc = res.headers.get("Location");
                if (loc) {
                    res = await ctx.env.ASSETS.fetch(
                        new Request(new URL(loc, url.origin), ctx.request)
                    );
                }
            }

            // 3) Return the content (no external redirect), URL stays "/"
            return res;
        }
    }

    // All other cases: normal handling
    return ctx.next();
};