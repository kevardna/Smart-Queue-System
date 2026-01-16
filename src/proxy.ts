import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const pathname = req.nextUrl.pathname

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  let decoded
  try {
    decoded = verifyToken(token)
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (pathname.startsWith("/dashboard") && decoded.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  if (pathname.startsWith("/counter") && decoded.role !== "STAFF") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/counter/:path*"],
}
