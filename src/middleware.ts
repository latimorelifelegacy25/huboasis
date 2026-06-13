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
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME ?? "jackson";

  if (!adminPassword) {
    return new NextResponse(
      "Latimore OS admin is not configured. Set ADMIN_PASSWORD before exposing /admin.",
      { status: 503 }
    );
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
