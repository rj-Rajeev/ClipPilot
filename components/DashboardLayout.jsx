"use client";

import { useState } from "react";

export default function DashboardLayout({ sidebar, topbar, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white border-r p-4 overflow-y-auto
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        {sidebar}
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOPBAR */}
        <div className="bg-white p-3 border-b flex items-center gap-2">

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden px-2 py-1 border rounded"
          >
            ☰
          </button>

          <div className="flex-1">
            {topbar}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-3 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}