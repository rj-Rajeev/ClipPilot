"use client";

export default function VideoCard({
  video,
  isSelected,
  onSelect,
  onUpload,
}) {
  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-2 transition ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } ${video.uploaded ? "opacity-70" : ""}`}
    >
      {/* Thumbnail */}
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video rounded overflow-hidden"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition">
          <div className="bg-black text-white text-xs px-2 py-1 rounded">
            ▶ Play
          </div>
        </div>
      </a>

      {/* Title */}
      <p className="text-sm mt-2 line-clamp-2 leading-tight">
        {video.title}
      </p>

      {/* Status */}
      <div className="mt-1 text-xs flex gap-2">
        {video.uploaded && (
          <span className="bg-green-100 text-green-700 px-2 py-[2px] rounded">
            Uploaded
          </span>
        )}
        {video.uploading && (
          <span className="bg-yellow-100 text-yellow-700 px-2 py-[2px] rounded">
            Uploading...
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-2 text-xs gap-2">

        {/* Select */}
        <button
          disabled={video.uploaded}
          onClick={() => onSelect(video.videoId)}
          className={`flex-1 border rounded py-1 ${
            video.uploaded
              ? "text-gray-400 border-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          {isSelected ? "Unselect" : "Select"}
        </button>

        {/* Upload */}
        <button
          disabled={video.uploaded || video.uploading}
          onClick={() => onUpload(video.videoId)}
          className={`flex-1 rounded py-1 ${
            video.uploaded
              ? "bg-gray-200 text-gray-500"
              : "bg-black text-white"
          }`}
        >
          {video.uploading ? "..." : "Upload"}
        </button>
      </div>
    </div>
  );
}