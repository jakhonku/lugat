import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// ┌─────────────────────────────────────────────────────────────┐
// │  SAYTNI YOPISH / OCHISH                                       │
// │  1 = sayt YOPIQ (503 error chiqadi)                          │
// │  0 = sayt OCHIQ (odatdagidek ishlaydi)                       │
// │  Faqat shu raqamni o'zgartiring:                             │
// └─────────────────────────────────────────────────────────────┘
const MAINTENANCE = 0;

const MAINTENANCE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>503 Service Unavailable</title>
<style>
  html,body{height:100%;margin:0}
  body{background:#fff;color:#333;font-family:Arial,Helvetica,sans-serif;
    display:flex;align-items:center;justify-content:center;text-align:center}
  .box{padding:20px}
  h1{font-size:56px;margin:0 0 10px;font-weight:700;color:#000}
  p{font-size:18px;margin:6px 0;color:#555}
  hr{border:none;border-top:1px solid #ddd;margin:20px auto;width:60%}
</style>
</head>
<body>
  <div class="box">
    <h1>503</h1>
    <p>Service Temporarily Unavailable</p>
    <hr>
    <p>The server is temporarily unable to service your request.</p>
  </div>
</body>
</html>`;

export async function middleware(request: NextRequest) {
  if (MAINTENANCE === 1) {
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "3600",
      },
    });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets, image optimization,
     * the manifest, the service worker and icon files.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)",
  ],
};
