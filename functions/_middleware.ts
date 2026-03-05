// /functions/_middleware.ts
export const onRequest: PagesFunction = async (ctx) => {
    const url = new URL(ctx.request.url);
    const host = url.hostname;

    if (host === "shop.azeite-rodrigues.info") {
        if (url.pathname === "/" || url.pathname === "/index.html") {
            // 1) Fetch /shop.html from static assets
            let res = await ctx.env.ASSETS.fetch(
                new Request(new URL("/shop.html", url.origin), ctx.request)
            );

            // 2) Follow internal redirects (clean-URL behavior) so the browser URL stays "/"
            if (res.status >= 300 && res.status < 400) {
                const loc = res.headers.get("Location");
                if (loc) {
                    res = await ctx.env.ASSETS.fetch(
                        new Request(new URL(loc, url.origin), ctx.request)
                    );
                }
            }

            // 3) Clone to make headers mutable and set useful headers
            const out = new Response(res.body, res);

            // Standard HTTP "Date" header (RFC 7231 format)
            if (!out.headers.has("Date")) {
                out.headers.set("Date", new Date().toUTCString());
            }

            // ---- Extra useful headers ----
            // Cache-Control: control CDN/browser caching
            // Choose ONE of the following strategies:

            // A) Cache for 10 minutes at the browser, allow Cloudflare to revalidate quickly
            out.headers.set("Cache-Control", "public, max-age=600, must-revalidate");

            // B) (Alternative) No cache at all (uncomment if you want fully dynamic behavior)
            // out.headers.set("Cache-Control", "no-store");

            // Vary: tell caches that the response can change based on headers
            // Here we vary by "Accept-Encoding" (gzip/brotli), and "Accept-Language" if you localize later
            out.headers.set("Vary", "Accept-Encoding, Accept-Language");

            // A custom marker so you can verify the variant easily in dev tools
            out.headers.set("X-Site-Variant", "shop");
            
            return out;
        }
    }

    // Other hostnames or paths → default handling
    return ctx.next();
};
