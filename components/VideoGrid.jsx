"use client";

import VideoCard from "./VideoCard";

export default function VideoGrid({
  videos = [],
  selected,
  toggleSelect,
  onUpload,
  loading,
}) {
  // ✅ Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-200 animate-pulse rounded"
          />
        ))}
      </div>
    );
  }

  // ✅ Empty state
  if (!videos.length) {
    return (
      <p className="text-center text-gray-500 mt-10 text-sm">
        No videos found
      </p>
    );
  }

  // ✅ Deduplicate (safety)
  const uniqueVideos = Array.from(
    new Map(videos.map((v) => [v.videoId, v])).values()
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
      {uniqueVideos.map((v) => (
        <VideoCard
          key={v.videoId}
          video={v}
          isSelected={selected.has(v.videoId)}
          onSelect={toggleSelect}
          onUpload={onUpload}
        />
      ))}
    </div>
  );
}