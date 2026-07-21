import { NextRequest, NextResponse } from "next/server";
import { checkPassword, adminCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const redirectTo = String(form.get("redirect") ?? "/fr/admin");

  const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);

  if (checkPassword(password)) {
    const cookie = adminCookie();
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 heures
      path: "/",
    });
  }

  return response;
}
