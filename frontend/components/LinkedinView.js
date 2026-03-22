"use client";

import { useState, useEffect } from "react";
import { authAPI } from "../services/authAPI";

export default function LinkedinView({ candidateId, date }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    if (!candidateId || !date) return;

    try {
      setLoading(true);

      const res = await authAPI.getLinkedinActivities(candidateId, date);

      const parsed =
        typeof res.body === "string" ? JSON.parse(res.body) : res;

      setData(parsed.activities || []);
    } catch (err) {
      console.error("ERROR:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [candidateId, date]);

  /* ================= WEEK ================= */
  const getWeekRange = (dateStr) => {
    const d = new Date(dateStr);
    const start = new Date(d);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const format = (x) => x.toISOString().split("T")[0];
    return { start: format(start), end: format(end) };
  };

  const week = getWeekRange(date);

  /* ================= KPI ================= */
  const total = data.length;
  const completed = data.filter((t) => t.status === "COMPLETED").length;
  const inProgress = data.filter((t) => t.status === "IN_PROGRESS").length;
  const due = data.filter((t) => t.status === "DUE").length;

  return (
    <div className="p-2">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          LinkedIn Activities
        </h1>

        <p className="text-sm text-[var(--text-secondary)]">
          {week.start} → {week.end}
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: total },
          { label: "Due", value: due },
          { label: "In Progress", value: inProgress },
          { label: "Completed", value: completed },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border-color)]"
          >
            <p className="text-gray-400 text-sm">{item.label}</p>
            <h2 className="text-2xl font-bold mt-2">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-gray-400 mt-10">
          Loading activities...
        </div>
      )}

      {/* EMPTY */}
      {!loading && data.length === 0 && (
        <div className="empty-box text-center mt-10">
          <p className="text-lg font-medium">
            No LinkedIn Activities Found
          </p>
        </div>
      )}

      {/* LIST */}
      {!loading && data.length > 0 && (
        <div className="space-y-4">

          {data.map((task, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[var(--card)] card-hover flex justify-between items-start"
            >

              {/* LEFT */}
              <div>
                <p className="font-semibold text-lg">
                  {task.title}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {task.what_to_do}
                </p>

                <div className="flex gap-3 mt-3 text-xs text-gray-500">
                  <span>📅 {task.due_date}</span>
                  <span>•</span>
                  <span>{task.task_type}</span>
                </div>

                {/* EXTRA */}
                {task.task_type === "TIPS" && (
                  <p className="text-xs mt-2 text-yellow-400">
                    💡 {task.tips_content}
                  </p>
                )}

                {task.task_type === "OUTREACH" && (
                  <p className="text-xs mt-2 text-blue-400">
                    👤 {task.recipient_name} ({task.recipient_title})
                  </p>
                )}
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end gap-2">

                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    task.status === "COMPLETED"
                      ? "bg-green-500/10 text-green-400"
                      : task.status === "IN_PROGRESS"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {task.status}
                </span>

                <span className="text-xs text-gray-400">
                  {new Date(task.created_at).toLocaleTimeString()}
                </span>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}