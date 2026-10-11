// Server-side admin check. The password lives in env vars / this file on the SERVER,
// so it is never shipped inside the browser JavaScript bundle.
export async function POST(request) {
  const { email, password } = await request.json();
  const okEmail = process.env.ADMIN_EMAIL || "admin@embrione.pes.edu";
  const okPass = process.env.ADMIN_PASSWORD || "EmbrioneAdmin@2026";
  if (email === okEmail && password === okPass) return Response.json({ ok: true });
  return Response.json({ ok: false }, { status: 401 });
}
