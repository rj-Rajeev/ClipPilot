import { connectDB } from "../../lib/mongoose";
import Video from "../../models/Video";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { channelUrl } = await req.json();
    const apiKey = process.env.YOUTUBE_API_KEY;

    await connectDB();

    const handle = channelUrl.split("@")[1];

    // 1️⃣ Get uploads playlist
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${handle}&key=${apiKey}`
    );

    const channelData = await channelRes.json();

    const uploadsPlaylist =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    let nextPageToken = "";
    let allVideos = [];

    // 2️⃣ Fetch all pages
    do {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`
      );

      const data = await res.json();

      data.items.forEach((item) => {
        allVideos.push({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails?.medium?.url,
          publishedAt: item.snippet.publishedAt,
        });
      });

      nextPageToken = data.nextPageToken;

    } while (nextPageToken);

    // 3️⃣ Save to DB
    for (const v of allVideos) {
      await Video.updateOne(
        { videoId: v.videoId },
        v,
        { upsert: true }
      );
    }

    return NextResponse.json({
      count: allVideos.length,
    });

  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}