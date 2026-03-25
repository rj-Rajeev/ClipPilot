// app/api/models/Channel.js

import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    title: String,
    thumbnail: String,
  },
  { timestamps: true }
);

// ✅ prevent duplicates
ChannelSchema.index(
  { userId: 1, channelId: 1 },
  { unique: true }
);

export default mongoose.models.Channel ||
  mongoose.model("Channel", ChannelSchema);