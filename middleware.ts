import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/admin") && !url.pathname.startsWith("/admin-decoy")) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.next();
}
