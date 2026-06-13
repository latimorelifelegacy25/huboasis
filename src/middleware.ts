import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Admin authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Latimore OS Admin"',
    },
  });
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME ?? "jackson";

  // The app already has Supabase email/password admin login. ADMIN_PASSWORD is an
  // optional extra Basic Auth gate for deployments that need another perimeter.
  if (!adminPassword) {
    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const decoded = atob(authorization.slice(6));
    const [username, ...passwordParts] = decoded.split(":");
    const password = passwordParts.join(":");

    if (username === adminUsername && password === adminPassword) {
      return NextResponse.next();
    }
  } catch {
    return unauthorized();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/admin/:path*"],
};
