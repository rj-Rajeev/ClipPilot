"use client";

import { useState } from "react";

export default function ChannelSidebar({
  channels = [],
  selectedChannel,
  onSelectChannel,
  onAddChannel,
  onDeleteChannel, // ✅ NEW
  loading,
}) {
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!input.trim()) return;

    setAdding(true);
    await onAddChannel(input);
    setInput("");
    setAdding(false);
  }

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <h2 className="font-semibold mb-3 text-sm">Channels</h2>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">

        {loading && (
          <p className="text-sm text-gray-500">Loading...</p>
        )}

        {!loading && channels.length === 0 && (
          <p className="text-sm text-gray-500">
            No channels added
          </p>
        )}

        {channels.map((ch) => (
          <div
            key={ch.channelId}
            className={`group flex items-center justify-between gap-2 p-2 rounded cursor-pointer ${
              selectedChannel?.channelId === ch.channelId
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            {/* LEFT (clickable) */}
            <div
              onClick={() => onSelectChannel(ch)}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <img
                src={ch.thumbnail}
                className="w-8 h-8 rounded-full"
              />

              <span className="text-sm truncate">
                {ch.title}
              </span>
            </div>

            {/* DELETE (hover only) */}
            {onDeleteChannel && (
              <button
                onClick={() => onDeleteChannel(ch.channelId)}
                className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ADD CHANNEL */}
      <div className="mt-3 border-t pt-3">

        <input
          className="w-full border rounded px-2 py-1 text-sm"
          placeholder="Channel URL"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={handleAdd}
          disabled={adding}
          className="w-full mt-2 bg-black text-white py-1 rounded text-sm"
        >
          {adding ? "Adding..." : "Add Channel"}
        </button>
      </div>
    </div>
  );
}