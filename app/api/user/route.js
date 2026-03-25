import { getTokens, saveTokens } from "../lib/db";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");

    if (!state) {
      return NextResponse.json({ user: null });
    }

    let tokens = await getTokens(state);

    if (!tokens) {
      return NextResponse.json({ user: null });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials(tokens);

    // ✅ FORCE refresh if expired
    if (!tokens.access_token || (tokens.expiry_date && Date.now() >= tokens.expiry_date)) {
      console.log("🔄 Refreshing token...");

      const { credentials } = await oauth2Client.refreshAccessToken();

      tokens = {
        ...tokens,
        ...credentials,
      };

      // ✅ Save updated tokens
      await saveTokens(state, tokens);

      oauth2Client.setCredentials(tokens);
    }

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    return NextResponse.json({
      user: {
        name: data.name,
        email: data.email,
        picture: data.picture,
      },
    });

  } catch (err) {
    console.error("USER API ERROR:", err);

    return NextResponse.json(
      { user: null },
      { status: 200 } // prevent frontend crash
    );
  }
}