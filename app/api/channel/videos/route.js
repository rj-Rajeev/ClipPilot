// app/api/channel/videos/route.js

import { connectDB } from "../../lib/mongoose";
import Video from "../../models/Video";
import Token from "../../models/Token";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const channelId = searchParams.get("channelId");
    const filter = searchParams.get("filter"); // ✅ FIXED
    const sort = searchParams.get("sort");     // ✅ FIXED
    const state = searchParams.get("state");

    if (!channelId || !state) {
      return Response.json(
        { error: "Missing channelId or state" },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ Resolve userId
    const token = await Token.findOne({ state }).lean();
    if (!token) {
      return Response.json(
        { error: "Invalid state" },
        { status: 401 }
      );
    }

    const userId = token.userId;

    // ✅ FILTER LOGIC
    let query = {
      userId,
      channelId,
    };

    if (filter === "uploaded") {
      query.uploaded = true;
    }

    // ✅ SORT LOGIC
    let sortOption = { publishedAt: -1 }; // latest default

    if (sort === "oldest") {
      sortOption = { publishedAt: 1 };
    }

    const videos = await Video.find(query)
      .sort(sortOption)
      .lean();

    return Response.json({ videos });

  } catch (err) {
    console.error("VIDEOS API ERROR:", err);

    return Response.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}