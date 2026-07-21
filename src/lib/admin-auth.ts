import { createHmac } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "d130_admin";

function expectedToken() {
  const password = process.env.ADMIN_PASSWORD ?? "district130";
  const secret = process.env.ADMIN_COOKIE_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update(password).digest("hex");
}

export function checkPassword(password: string) {
  return password === (process.env.ADMIN_PASSWORD ?? "district130");
}

export function adminCookie() {
  return { name: COOKIE_NAME, value: expectedToken() };
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === expectedToken();
}
