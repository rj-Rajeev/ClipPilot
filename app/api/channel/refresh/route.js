import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/lib/mongoose";
import Channel from "@/app/api/models/Channel";
import Video from "@/app/api/models/Video";
import Token from "@/app/api/models/Token";

export async function POST(req) {
  try {
    const { channelId, state } = await req.json();
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!channelId || !state) {
      return NextResponse.json(
        { success: false, error: "Missing channelId or state" },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ Resolve userId
    const token = await Token.findOne({ state }).lean();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Invalid state" },
        { status: 401 }
      );
    }

    const userId = token.userId;

    // ✅ Fetch channel details
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelRes.json();
    const ch = channelData.items?.[0];

    if (!ch) {
      return NextResponse.json(
        { success: false, error: "Channel not found" },
        { status: 404 }
      );
    }

    const uploads = ch.contentDetails.relatedPlaylists.uploads;

    // ✅ Save channel (user scoped)
    await Channel.updateOne(
      { userId, channelId },
      {
        userId,
        channelId,
        title: ch.snippet.title,
        thumbnail: ch.snippet.thumbnails.default.url,
      },
      { upsert: true }
    );

    // ✅ Fetch videos
    let nextPageToken = "";
    const videoMap = new Map(); // dedupe

    do {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`
      );

      const data = await res.json();

      data.items?.forEach((item) => {
        const videoId = item.snippet.resourceId.videoId;

        videoMap.set(videoId, {
          userId,
          channelId,
          videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          publishedAt: item.snippet.publishedAt,
        });
      });

      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    const allVideos = Array.from(videoMap.values());

    // ✅ Bulk upsert (fast + safe)
    const bulkOps = allVideos.map((v) => ({
      updateOne: {
        filter: {
          userId: v.userId,
          channelId: v.channelId,
          videoId: v.videoId,
        },
        update: {
          $set: {
            title: v.title,
            thumbnail: v.thumbnail,
            publishedAt: v.publishedAt,
          },
          $setOnInsert: {
            uploaded: false,
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length) {
      await Video.bulkWrite(bulkOps);
    }

    return NextResponse.json({
      success: true,
      channel: {
        channelId,
        title: ch.snippet.title,
        thumbnail: ch.snippet.thumbnails.default.url,
      },
      totalVideos: allVideos.length,
    });

  } catch (error) {
    console.error("REFRESH API ERROR:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}