"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function LinkList({ links, toggleStatus, deleteLink }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  const filteredLinks = links.filter((link) => {
    const matchesSearch = link.domain
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterOption === "all" ||
      (filterOption === "safe" && link.is_safe) ||
      (filterOption === "unsafe" && !link.is_safe) ||
      (filterOption === "blocked" && link.is_blocked) ||
      (filterOption === "unblocked" && !link.is_blocked);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-5xl w-full mx-auto p-4 space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
        <input
          type="text"
          placeholder="Search domain..."
          className="input input-bordered w-full md:w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="select select-bordered w-full md:w-40"
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
        >
          <option value="all">All</option>
          <option value="safe">Safe</option>
          <option value="unsafe">Unsafe</option>
          <option value="blocked">Blocked</option>
          <option value="unblocked">Unblocked</option>
        </select>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto bg-base-200 rounded-xl shadow-xl">
        <table className="table table-zebra w-full text-sm md:text-base">
          <thead>
            <tr className="bg-base-300 text-base font-semibold">
              <th>Domain</th>
              <th>URL</th>
              <th className="text-center">Status</th>
              <th className="text-center">Blocked</th>
              <th className="text-center">Action</th>
              <th className="text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredLinks.length > 0 ? (
              filteredLinks.map((link, idx) => (
                <tr key={idx}>
                  <td className="truncate font-medium text-white max-w-[180px]">
                    {link.domain}
                  </td>

                  <td
                    className="truncate text-gray-400 max-w-[220px]"
                    title={link.url}
                  >
                    {link.url.length > 30
                      ? `${link.url.slice(0, 30)}...`
                      : link.url}
                  </td>

                  <td className="text-center">
                    <span
                      className={`badge badge-sm ${
                        link.is_safe ? "badge-success" : "badge-warning"
                      }`}
                    >
                      {link.is_safe ? "Safe" : "Unknown"}
                    </span>
                  </td>

                  <td className="text-center">
                    <span
                      className={`badge badge-sm ${
                        link.is_blocked ? "badge-error" : "badge-success"
                      }`}
                    >
                      {link.is_blocked ? "Blocked" : "Unblocked"}
                    </span>
                  </td>

                  <td className="text-center">
                    <label className="cursor-pointer flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        className="toggle toggle-sm"
                        checked={!link.is_blocked}
                        onChange={() => toggleStatus(link.url)}
                      />
                      <span className="text-xs text-gray-500">
                        {link.is_blocked ? "Blocked" : "Allowed"}
                      </span>
                    </label>
                  </td>

                  <td className="text-center">
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => deleteLink(link.url)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-400">
                  No links match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}