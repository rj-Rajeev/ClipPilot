"use client";

export default function FiltersBar({
  filter,
  setFilter,
  sort,
  setSort,
  onRefresh,
}) {
  return (
    <div className="flex justify-between items-center mb-4">

      {/* LEFT: FILTER */}
      <div className="flex gap-2">
        {["all", "uploaded"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${
              filter === f
                ? "bg-black text-white"
                : "bg-white border"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* RIGHT: SORT + REFRESH */}
      <div className="flex items-center gap-3">

        {/* Sort Dropdown */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}