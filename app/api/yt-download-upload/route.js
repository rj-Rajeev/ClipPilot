import { NextResponse } from "next/server";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import ytdlp from "yt-dlp-exec";
import { google } from "googleapis";
import { getTokens } from "../lib/db";

export const runtime = "nodejs";

export async function POST(req) {
  let body;

  try {
    // ✅ SAFE PARSE (prevents crash)
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    console.log("BODY RECEIVED:", body);

    const { url, state, title, thumbnail } = body;

    // ✅ VALIDATION (clear logs)
    if (!url || !state) {
      console.log("❌ Missing input:", { url, state });

      return NextResponse.json(
        {
          error: "Missing url or state",
          received: { url, state },
        },
        { status: 400 }
      );
    }

    // ✅ GET TOKENS
    const tokens = await getTokens(state);

    if (!tokens) {
      console.log("❌ No tokens found for state:", state);

      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // ✅ CLEAN SHORTS URL
    const cleanUrl = url.includes("/shorts/")
      ? url.replace("/shorts/", "/watch?v=")
      : url;

    const outPath = join(tmpdir(), `${randomUUID()}.mp4`);

    console.log("⬇️ Downloading:", cleanUrl);
    console.log("📁 Saving to:", outPath);

    // ✅ yt-dlp path (stable)
    const ytdlpPath = path.join(
      process.cwd(),
      "node_modules",
      "yt-dlp-exec",
      "bin",
      process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
    );

    const ytdlpCustom = ytdlp.create(ytdlpPath);

    // ✅ DOWNLOAD
    await ytdlpCustom(cleanUrl, {
      output: outPath,
      format: "best",
    });

    if (!fs.existsSync(outPath)) {
      throw new Error("Download failed (file not found)");
    }

    console.log("✅ Download complete");

    // ✅ GOOGLE AUTH
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BASE_URL || "http://localhost:3000"}/api/auth/callback`
    );

    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    console.log("⬆️ Uploading to YouTube...");

    const res = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: title || "Auto Upload",
          description: "Uploaded via system",
        },
        status: {
          privacyStatus: "private",
        },
      },
      media: {
        body: fs.createReadStream(outPath),
      },
    });

    console.log("✅ Upload success:", res.data.id);

    // ✅ CLEANUP
    try {
      await fs.promises.unlink(outPath);
    } catch (e) {
      console.log("⚠️ Cleanup failed:", e.message);
    }

    return NextResponse.json({
      success: true,
      videoId: res.data.id,
    });

  } catch (err) {
    console.error("🔥 API ERROR:", err);

    return NextResponse.json(
      {
        error: err.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}