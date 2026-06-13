import { NextRequest, NextResponse } from "next/server";

const ADMIN_MATCHERS = ["/admin", "/api/admin"];

function isAdminPath(pathname: string) {
  return ADMIN_MATCHERS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function withPrivateHeaders(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

function notFound() {
  return withPrivateHeaders(new NextResponse("Not Found", { status: 404 }));
}

function unauthorized() {
  return withPrivateHeaders(
    new NextResponse("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Latimore OS"',
      },
    })
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME ?? "jackson";

  // Fail closed: if the deployment does not have ADMIN_PASSWORD configured,
  // admin routes are not viewable by anyone.
  if (!adminPassword) {
    return notFound();
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const decoded = atob(authorization.slice(6));
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return unauthorized();
    }

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    if (username === adminUsername && password === adminPassword) {
      return withPrivateHeaders(NextResponse.next());
    }
  } catch {
    return unauthorized();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin", "/api/admin/:path*"],
};
