"use client";

import React, { useState, useMemo } from "react";

const mockLogs = [
  { id: 1, user: "Admin", role: "Admin", action: "Created module", target: "Data Science", date: "2026-04-01", status: "Success" },
  { id: 2, user: "Dr. Dlamini", role: "Lecturer", action: "Marked attendance", target: "Networks", date: "2026-04-02", status: "Success" },
  { id: 3, user: "System", role: "System", action: "Auto backup", target: "Database", date: "2026-04-03", status: "Success" },
  { id: 4, user: "Admin", role: "Admin", action: "Deleted course", target: "Old Module", date: "2026-04-04", status: "Warning" },
];

export default function AdminLogs() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredLogs = useMemo(() => {
    return mockLogs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "All" || log.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter]);

  const getStatusStyle = (status) => {
    if (status === "Success") return { background: "#e0f2fe", color: "#0369a1" };
    if (status === "Warning") return { background: "#fef3c7", color: "#b45309" };
    return { background: "#fee2e2", color: "#b91c1c" };
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: 30 }}>
      
      {/* HEADER */}
      <div style={{
        background: "#ffffff",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        borderLeft: "6px solid #2563eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <h2 style={{ margin: 0, color: "#1e3a8a" }}>Admin Activity Logs</h2>
        <p style={{ marginTop: 5, color: "#64748b" }}>
          Monitor all system activities and user interactions
        </p>
      </div>

      {/* FILTERS */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 20,
        flexWrap: "wrap"
      }}>
        <input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #cbd5f5",
            width: 220
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #cbd5f5"
          }}
        >
          <option>All</option>
          <option>Admin</option>
          <option>Lecturer</option>
          <option>System</option>
        </select>

        <button style={primaryBtn}>Export CSV</button>
        <button style={secondaryBtn}>Export PDF</button>
      </div>

      {/* TABLE */}
      <div style={{
        background: "#ffffff",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#eff6ff" }}>
            <tr>
              <th style={th}>User</th>
              <th style={th}>Role</th>
              <th style={th}>Action</th>
              <th style={th}>Target</th>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} style={{ transition: "0.2s" }}>
                <td style={td}>{log.user}</td>
                <td style={td}>{log.role}</td>
                <td style={td}>{log.action}</td>
                <td style={td}>{log.target}</td>
                <td style={td}>{log.date}</td>
                <td style={td}>
                  <span style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: "600",
                    ...getStatusStyle(log.status)
                  }}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
            No logs found
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const th = {
  padding: 14,
  textAlign: "left",
  fontSize: 13,
  color: "#1e3a8a"
};

const td = {
  padding: 14,
  borderTop: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#334155"
};

const primaryBtn = {
  padding: "10px 16px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const secondaryBtn = {
  padding: "10px 16px",
  background: "#e2e8f0",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};