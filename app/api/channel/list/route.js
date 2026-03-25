// app/api/channel/list/route.js

import { connectDB } from "../../lib/mongoose";
import Channel from "../../models/Channel";
import Token from "../../models/Token";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const state = req.nextUrl.searchParams.get("state");

    if (!state) {
      return NextResponse.json({ channels: [] });
    }

    // ✅ Resolve userId from state
    const token = await Token.findOne({ state }).lean();

    if (!token) {
      return NextResponse.json({ channels: [] });
    }

    const userId = token.userId;

    // ✅ Fetch only user's channels
    const channels = await Channel.find({ userId }).lean();

    return NextResponse.json({ channels });

  } catch (err) {
    console.error("CHANNEL LIST ERROR:", err);

    return NextResponse.json(
      { channels: [] },
      { status: 500 }
    );
  }
}