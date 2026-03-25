"use client";

import { useEffect, useRef, useState } from "react";

export default function Topbar({ onUpload, uploading }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  // ---------------- LOAD USER ----------------

  async function loadUser() {
    const state = localStorage.getItem("yt_state");
    if (!state) return;

    const res = await fetch(`/api/user?state=${state}`);
    const data = await res.json();

    setUser(data.user);

    if (data.user) {
      localStorage.setItem(
        `profile_${state}`,
        JSON.stringify(data.user)
      );
    }
  }

  function loadAccounts() {
    const acc = JSON.parse(localStorage.getItem("yt_accounts") || "[]");
    setAccounts(acc);
  }

  useEffect(() => {
    loadUser();
    loadAccounts();
  }, []);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------- ACTIONS ----------------

  function handleUpload() {
    if (!videoUrl.trim()) return;
    onUpload(videoUrl);
    setVideoUrl("");
  }

  function switchAccount(state) {
    localStorage.setItem("yt_state", state);
    window.location.reload(); // keep for now (simple)
  }

  function addAccount() {
    window.location.href = "/api/auth/start";
  }

  function logoutAll() {
    localStorage.clear();
    window.location.reload();
  }

  // ---------------- UI ----------------

  return (
    <div className="flex items-center justify-between gap-2">

      {/* LEFT: INPUT */}
      <div className="flex flex-1 gap-2 min-w-0">

        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
          placeholder="Paste video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-black text-white px-3 py-1 rounded text-sm whitespace-nowrap"
        >
          {uploading ? "..." : "Upload"}
        </button>
      </div>

      {/* RIGHT: PROFILE */}
      <div className="relative" ref={dropdownRef}>

        {/* NOT LOGGED IN */}
        {!user && (
          <a
            href="/api/auth/start"
            className="bg-black text-white px-3 py-1 rounded text-sm"
          >
            Login
          </a>
        )}

        {/* LOGGED IN */}
        {user && (
          <>
            <img
              src={user.picture}
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setOpen((v) => !v)}
            />

            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded p-3 z-50 text-sm">

                {/* USER */}
                <div>
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>

                <hr className="my-2" />

                {/* ACCOUNTS */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Accounts
                  </p>

                  {accounts.map((acc) => {
                    const profile = JSON.parse(
                      localStorage.getItem(`profile_${acc}`) || "null"
                    );

                    return (
                      <button
                        key={acc}
                        onClick={() => switchAccount(acc)}
                        className="flex items-center gap-2 w-full text-left py-1 hover:bg-gray-100 rounded px-1"
                      >
                        {profile?.picture && (
                          <img
                            src={profile.picture}
                            className="w-5 h-5 rounded-full"
                          />
                        )}
                        <span className="truncate">
                          {profile?.email || acc.slice(0, 6)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <hr className="my-2" />

                {/* ACTIONS */}
                <button
                  onClick={addAccount}
                  className="block w-full text-left py-1 hover:bg-gray-100 rounded px-1"
                >
                  Add Account
                </button>

                <button
                  onClick={() => {
                    const current = localStorage.getItem("yt_state");

                    let accs = JSON.parse(
                      localStorage.getItem("yt_accounts") || "[]"
                    );

                    accs = accs.filter((a) => a !== current);

                    localStorage.setItem("yt_accounts", JSON.stringify(accs));

                    if (accs.length > 0) {
                      localStorage.setItem("yt_state", accs[0]);
                    } else {
                      localStorage.removeItem("yt_state");
                    }

                    window.location.reload();
                  }}
                  className="block w-full text-left py-1 text-red-600 hover:bg-red-50 rounded px-1"
                >
                  Logout
                </button>

                <button
                  onClick={logoutAll}
                  className="block w-full text-left py-1 text-red-600 hover:bg-red-50 rounded px-1"
                >
                  Logout All
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}