import { NextRequest, NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/fr/admin", request.url), 303);
  response.cookies.delete(adminCookie().name);
  return response;
}
