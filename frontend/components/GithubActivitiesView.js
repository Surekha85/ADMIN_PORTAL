"use client";

import { useEffect, useState } from "react";
import { authAPI } from "../services/authAPI";

export default function GithubActivitiesView({ candidateId, date }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!candidateId || !date) return;

    authAPI.getGithubActivities(candidateId, date).then((res) => {
      const parsed =
        typeof res.body === "string" ? JSON.parse(res.body) : res;

      setData(parsed);
    });
  }, [candidateId, date]);

  if (!data) return <p className="text-gray-400">Loading...</p>;

  const project = data.current_project || {};
  const activity = data.recent_activity || [];
  const summary = data.summary || {};
  const completed = data.completed_projects || [];

  return (
    <div className="space-y-6">

      {/* ================= CURRENT PROJECT ================= */}
      <div className="card p-5">

        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <p className="section-title">Current Project</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT */}
          <div>
            <h3 className="font-semibold text-lg">
              {project.name || "Project Name"}
            </h3>

            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Started: {project.start_date || "-"}
            </p>

            {/* PROGRESS */}
            <div className="mt-3">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>

              <p className="text-xs mt-1 text-[var(--text-secondary)]">
                Progress: {project.progress || 0}%
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <p className="text-sm">
              This Week:{" "}
              <b>{summary.commits || 0} commits</b>
            </p>

            <p className="text-sm mt-2">
              Status:{" "}
              <span className="text-green-500 font-medium">
                {project.status || "Active"}
              </span>
            </p>

            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Est: {project.estimated_completion || "-"}
            </p>
          </div>

        </div>
      </div>

      {/* ================= ACTIVITY + SUMMARY ================= */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* RECENT ACTIVITY */}
        <div className="md:col-span-2 card p-5">

          <p className="section-title">Recent Activity</p>

          {activity.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              No activity
            </p>
          ) : (
            activity.map((a, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {a.date}
                  </p>
                </div>

                <button className="btn-blue text-xs">
                  View Commit
                </button>
              </div>
            ))
          )}
        </div>

        {/* SUMMARY */}
        <div className="card p-5">

          <p className="section-title">This Week’s Summary</p>

          <ul className="text-sm space-y-2">
            <li>✔ {summary.commits || 0} Commits</li>
            <li>✔ {summary.features || 0} New Features</li>
            <li>✔ {summary.bugs || 0} Bug Fix</li>
            <li>✔ {summary.deployments || 0} Deployment</li>
          </ul>

          <p className="text-xs text-[var(--text-secondary)] mt-3">
            {summary.note || ""}
          </p>
        </div>

      </div>

      {/* ================= COMPLETED PROJECTS ================= */}
      <div>

        <p className="section-title">Completed Projects</p>

        <div className="grid md:grid-cols-3 gap-4">

          {completed.map((p, i) => (
            <div key={i} className="card p-4">

              <h4 className="font-semibold">{p.name}</h4>

              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Duration: {p.duration}
              </p>

              <p className="text-sm text-[var(--text-secondary)]">
                Commits: {p.commits}
              </p>

              <button className="btn-blue text-xs mt-3">
                View Repo
              </button>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}