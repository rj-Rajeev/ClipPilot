import { google } from "googleapis";
import { saveTokens } from "../../lib/db";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return new Response("Missing code/state", { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_BASE_URL || "http://localhost:3000"}/api/auth/callback`
    );

    // ✅ Get tokens
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    // ✅ Fetch user info (IMPORTANT)
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    // ✅ Save tokens WITH user info
    await saveTokens(state, {
      ...tokens,
      userId: data.id,        // 🔥 IMPORTANT
      email: data.email,
      name: data.name,
      picture: data.picture,
    });

    // ✅ Redirect safely
    const redirectUrl = new URL(req.url);
    redirectUrl.pathname = "/";
    redirectUrl.search = `?auth_state=${state}`;

    return Response.redirect(redirectUrl);

  } catch (err) {
    console.error("AUTH CALLBACK ERROR:", err);

    return new Response("Auth failed", { status: 500 });
  }
}