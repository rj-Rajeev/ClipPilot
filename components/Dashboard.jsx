"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import ChannelSidebar from "./ChannelSidebar";
import Topbar from "./Topbar";
import VideoGrid from "./VideoGrid";
import FiltersBar from "./FiltersBar";
import BulkBar from "./BulkBar";
import Toasts from "./Toast";

export default function Dashboard() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(new Set());

  // ✅ NEW: separate filter + sort
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("latest");

  const [toasts, setToasts] = useState([]);

  const getState = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("yt_state")
      : null;

  const toast = (text) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2500);
  };

  const api = async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  // ---------------- LOAD ----------------

  const loadChannels = async () => {
    const state = getState();
    if (!state) return setChannels([]);

    const res = await fetch(`/api/channel/list?state=${state}`);
    const data = await res.json();

    setChannels(data.channels || []);
  };

  const loadVideos = async () => {
    if (!selectedChannel) return;

    const state = getState();
    if (!state) return setVideos([]);

    const res = await fetch(
      `/api/channel/videos?channelId=${selectedChannel.channelId}&filter=${filter}&sort=${sort}&state=${state}`
    );

    const data = await res.json();

    setVideos(data.videos || []);
    setSelected(new Set());
  };

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    loadVideos();
  }, [selectedChannel, filter, sort]);

  // ---------------- ACTIONS ----------------

  const handleUpload = async (url) => {
    const state = getState();
    if (!state) return toast("Login required");

    await api("/api/yt-download-upload", { url, state });
    toast("Uploaded");
  };

  const handleUploadVideo = async (id) => {
    const state = getState();
    if (!state) return toast("Login required");

    await api("/api/channel/upload", { videoId: id, state });
    await loadVideos();
  };

  const handleBulk = async () => {
    const state = getState();
    if (!state) return toast("Login required");

    for (const id of selected) {
      await api("/api/channel/upload", { videoId: id, state });
    }

    setSelected(new Set());
    await loadVideos();
    toast("Done");
  };

  const refresh = async () => {
    if (!selectedChannel) return;

    const state = getState();
    if (!state) return toast("Login required");

    await api("/api/channel/refresh", {
      channelId: selectedChannel.channelId,
      state,
    });

    await loadVideos();
    toast("Refreshed");
  };

  const handleAddChannel = async (url) => {
    const state = getState();
    if (!state) return toast("Login required");

    const data = await api("/api/channel/add", {
      channelUrl: url,
      state,
    });

    if (data.error) return toast(data.error);

    await loadChannels();
    setSelectedChannel(data.channel);
    toast("Channel added");
  };

  // ---------------- UI ----------------

  return (
    <>
      <Toasts toasts={toasts} />

      <DashboardLayout
        sidebar={
          <ChannelSidebar
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
            onAddChannel={handleAddChannel}
          />
        }
        topbar={<Topbar onUpload={handleUpload} />}
      >
        {selectedChannel && (
          <FiltersBar
            filter={filter}
            setFilter={setFilter}
            sort={sort}
            setSort={setSort}
            onRefresh={refresh}
          />
        )}

        <BulkBar count={selected.size} onUpload={handleBulk} />

        <VideoGrid
          videos={videos}
          selected={selected}
          toggleSelect={(id) => {
            const s = new Set(selected);
            s.has(id) ? s.delete(id) : s.add(id);
            setSelected(s);
          }}
          onUpload={handleUploadVideo}
        />
      </DashboardLayout>
    </>
  );
}