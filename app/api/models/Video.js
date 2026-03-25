// app/api/models/Video.js

import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    channelId: {
      type: String,
      required: true,
      index: true,
    },

    videoId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    publishedAt: {
      type: Date,
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    // ✅ Upload state
    uploaded: {
      type: Boolean,
      default: false,
    },

    uploading: {
      type: Boolean,
      default: false,
    },

    uploadedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Prevent duplicates (CRITICAL)
VideoSchema.index(
  { userId: 1, channelId: 1, videoId: 1 },
  { unique: true }
);

export default mongoose.models.Video ||
  mongoose.model("Video", VideoSchema);