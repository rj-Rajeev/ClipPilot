import { google } from "googleapis";
import fs from "fs";

export async function uploadToYouTube(filePath, title) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const res = await youtube.videos.insert({
    part: "snippet,status",
    requestBody: {
      snippet: {
        title: title || "Uploaded via script",
        description: "Uploaded automatically",
      },
      status: {
        privacyStatus: "private",
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  return res.data;
}