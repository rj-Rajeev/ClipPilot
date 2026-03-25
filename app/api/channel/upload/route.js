import { connectDB } from "../../lib/mongoose";
import Video from "../../models/Video";
import Token from "../../models/Token";

export async function POST(req) {
  try {
    const { videoId, state } = await req.json();

    await connectDB();

    // ✅ resolve user
    const token = await Token.findOne({ state }).lean();
    if (!token) {
      return Response.json({ error: "Invalid state" }, { status: 401 });
    }

    const userId = token.userId;

    // ✅ get video (IMPORTANT)
    const video = await Video.findOne({ userId, videoId });
    if (!video) {
      return Response.json({ error: "Video not found" }, { status: 404 });
    }

    // ✅ mark uploading
    await Video.updateOne(
      { userId, videoId },
      { uploading: true }
    );

    const url = `https://youtube.com/watch?v=${videoId}`;

    // ✅ call internal logic (not HTTP)
    const uploadRes = await fetch(
      `${process.env.APP_BASE_URL || "http://localhost:3000"}/api/yt-download-upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          state,
          title: video.title,       // ✅ use DB data
          thumbnail: video.thumbnail,
        }),
      }
    );

    const data = await uploadRes.json();

    if (!data.success) {
      throw new Error(data.error || "Upload failed");
    }

    // ✅ mark uploaded
    await Video.updateOne(
      { userId, videoId },
      {
        uploaded: true,
        uploading: false,
        uploadedAt: new Date(),
      }
    );

    return Response.json(data);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    // ❗ reset uploading flag
    await Video.updateOne(
      { videoId },
      { uploading: false }
    );

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}