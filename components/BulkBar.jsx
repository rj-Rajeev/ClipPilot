"use client";

export default function BulkBar({ count, onUpload }) {
  if (!count) return null;

  return (
    <div className="mb-4 bg-white p-3 rounded shadow flex justify-between">
      <span>{count} selected</span>

      <button
        onClick={onUpload}
        className="button-success"
      >
        Upload Selected
      </button>
    </div>
  );
}