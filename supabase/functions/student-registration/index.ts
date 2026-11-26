import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigin = "https://aioucoaching.blogspot.com";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});
const hashCode = async (code: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code.trim().toLowerCase()));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const origin = req.headers.get("origin");
  if (origin && origin !== allowedOrigin) return json({ error: "Forbidden origin." }, 403);

  try {
    const body = await req.json();
    const action = String(body.action ?? "");
    const code = String(body.code ?? "").trim();
    const url = Deno.env.get("SUPABASE_URL");
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    const secretKey = secretKeys.default;
    if (!url || !secretKey) return json({ error: "Registration service configuration unavailable." }, 500);
    const admin = createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });

    if (action === "validate") {
      if (!/^AIOU-[A-F0-9]{32}$/i.test(code)) return json({ error: "Registration Code valid nahi." }, 400);
      const { data, error } = await admin.schema("private").rpc("validate_student_registration_code", { p_code_hash: await hashCode(code) });
      if (error || data !== true) return json({ error: "Registration Code invalid, expired, used, ya revoked hai." }, 400);
      return json({ valid: true });
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return json({ error: "Signed-in account required." }, 401);
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    const user = authData.user;
    if (authError || !user || !user.email || !user.email_confirmed_at) {
      return json({ error: "Pehle apni email verify karke dobara login karein." }, 403);
    }

    if (action === "issue") {
      const { data: profile, error: profileError } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profileError || profile?.role !== "admin") return json({ error: "Admin access required." }, 403);
      const studentId = String(body.student_id ?? "");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(studentId)) {
        return json({ error: "Student record invalid." }, 400);
      }
      const { data, error } = await admin.schema("private").rpc("issue_student_registration_code", {
        p_student_id: studentId, p_admin_id: user.id, p_expires_days: 7,
      });
      if (error || !data?.length || !data[0]?.code) return json({ error: error?.message ?? "Code issue nahi ho saka." }, 400);
      return json({ code: data[0].code, expires_at: data[0].expires_at });
    }

    if (action === "link") {
      if (!/^AIOU-[A-F0-9]{32}$/i.test(code)) return json({ error: "Registration Code valid nahi." }, 400);
      const { data, error } = await admin.schema("private").rpc("redeem_student_registration_code", {
        p_code_hash: await hashCode(code), p_user_id: user.id, p_email: user.email,
      });
      if (error || !data) return json({ error: error?.message ?? "Student record link nahi ho saka." }, 400);
      return json({ linked: true });
    }
    return json({ error: "Unknown registration action." }, 400);
  } catch (_error) {
    return json({ error: "Registration request process nahi ho saki." }, 400);
  }
});
