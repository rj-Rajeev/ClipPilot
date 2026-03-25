// app/api/channel/add/route.js

import { connectDB } from "../../lib/mongoose";
import Channel from "../../models/Channel";
import Video from "../../models/Video";
import Token from "../../models/Token";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { channelUrl, state } = await req.json();
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!channelUrl || !state) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    await connectDB();

    // ✅ Resolve userId from state
    const token = await Token.findOne({ state }).lean();
    if (!token) {
      return NextResponse.json({ error: "Invalid state" }, { status: 401 });
    }

    const userId = token.userId;

    // ✅ Extract handle
    const handle = channelUrl.split("@")[1];

    // ✅ Fetch channel
    const chRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&forHandle=${handle}&key=${apiKey}`
    );
    const chData = await chRes.json();

    const ch = chData.items?.[0];
    if (!ch) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const channelId = ch.id;
    const uploads = ch.contentDetails.relatedPlaylists.uploads;

    // ✅ Prevent duplicate channel
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
    const videoMap = new Map(); // 🔥 dedupe at source

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

    // ✅ Bulk upsert (FAST + NO DUPLICATES)
    const bulkOps = allVideos.map((v) => ({
      updateOne: {
        filter: {
          userId: v.userId,
          channelId: v.channelId,
          videoId: v.videoId,
        },
        update: { $set: v },
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

  } catch (err) {
    console.error("CHANNEL ADD ERROR:", err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}