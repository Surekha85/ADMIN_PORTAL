"use client";

import { useEffect, useState, useRef } from "react";
import { authAPI } from "../services/authAPI";

export default function GithubActivitiesView({ candidateId }) {

  const [candidate, setCandidate] = useState(null);
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  // ✅ TOAST STATE
  const [toast, setToast] = useState("");

  //////////////////////////////////////////////////////
  // LOAD candidate (only for name display)
  //////////////////////////////////////////////////////
  useEffect(() => {
    const stored = localStorage.getItem("selectedCandidate");
    if (stored) {
      setCandidate(JSON.parse(stored));
    }
  }, []);

  //////////////////////////////////////////////////////
  // DEFAULT DATE
  //////////////////////////////////////////////////////
  useEffect(() => {
    const savedDate = localStorage.getItem("selectedDate");

    if (savedDate) {
      setDate(savedDate);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
    }
  }, []);

  //////////////////////////////////////////////////////
  // FETCH API
  //////////////////////////////////////////////////////
  const fetchGithubActivities = async () => {
    if (!candidateId || !date) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await authAPI.getGithubActivities(candidateId, date);
      setData(res);
    } catch (err) {
      const msg = err.message || "Failed to fetch GitHub activities";
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const lastFetchedDateRef = useRef("");

  //////////////////////////////////////////////////////
  // 🔥 MAIN EFFECT (FIXED)
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (!candidateId || !date) return;

    if (lastFetchedDateRef.current === date) return;

    lastFetchedDateRef.current = date;

    fetchGithubActivities();

  }, [candidateId, date]);

  //////////////////////////////////////////////////////
  // TOAST
  //////////////////////////////////////////////////////
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  //////////////////////////////////////////////////////
  // HANDLERS
  //////////////////////////////////////////////////////
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    localStorage.setItem("selectedDate", newDate);
  };

  //////////////////////////////////////////////////////
  // DERIVED DATA
  //////////////////////////////////////////////////////
  const allCommits =
    data?.projects?.flatMap((p) => p.commits || []) || [];

  const totalCommits = allCommits.length;

  useEffect(() => {
    if (!data?.projects?.length) return;

    setSelectedProject(data.projects[0]);
  }, [data]);

  const formatDateTime = (iso) => {
    const d = new Date(iso);

    const date = d.toISOString().split("T")[0];

    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${date} ${time}`;
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="min-h-screen p-6 bg-white dark:bg-[#0f172a] text-black dark:text-white">

      {/* 🔥 TOASTER */}
      {toast.message && (
        <div className={`fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg z-50 text-white
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

          <div>
            <h1 className="text-2xl font-bold">GitHub Activities</h1>
            {candidate && (
              <p className="text-sm text-gray-500">
                {candidate.first_name} {candidate.last_name}
              </p>
            )}
          </div>

          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="p-2 rounded border"
          />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-gray-400">Loading...</div>
      )}

      {/* EMPTY */}
      {!loading && data && (!data.projects || data.projects.length === 0) && (
        <div className="flex items-center justify-center h-[70vh]">

          <div className="text-center">

            <div className="
              w-20 h-20 mx-auto mb-5
              flex items-center justify-center
              rounded-full
              bg-[var(--bg-secondary)]
              text-[var(--primary)]
            ">
              📂
            </div>

            <h2 className="text-lg font-semibold">
              No GitHub Projects Found
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              No GitHub projects are available for this candidate yet.
            </p>

          </div>

        </div>
      )}

      {/* DASHBOARD */}
      {data && data.projects && data.projects.length > 0 && (
        <div className="space-y-6">

          {/* CURRENT PROJECT */}
          <div className="p-6 rounded-xl border bg-white dark:bg-[#1e293b] border-gray-200 dark:border-slate-700">

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">✔</span>
                <h2 className="font-semibold text-lg">Current Project</h2>
              </div>
            </div>

            {selectedProject && (
              <div className="grid grid-cols-2 gap-6">

                {/* LEFT SIDE */}
                <div>
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedProject.project_name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Started: {selectedProject.start_date?.split("T")[0]}
                  </p>
                </div>

                {/* RIGHT SIDE */}
                <div className="text-sm">

                  <p className="font-semibold mb-2">
                    This Week: {totalCommits} Commits
                  </p>

                  <p className="text-gray-500">
                    Status:{" "}
                    <span className="text-green-500 font-medium">
                      ● {selectedProject.status || "Actively Developing"}
                    </span>
                  </p>

                  <p className="text-gray-500 mt-2">
                    Estimation Date: {selectedProject.estimation_date || "-"}
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* ACTIVITY + SUMMARY */}
          <div className="grid grid-cols-3 gap-6">

            <div
              className={`col-span-2 h-[30vh] p-5 rounded-xl border bg-white dark:bg-[#1e293b] border-gray-200 dark:border-slate-700 flex flex-col overflow-y-auto`}>
              <h3 className="mb-4 font-semibold">Recent Activity</h3>

              {selectedProject?.commits?.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  No Recent Activity Found
                </div>
              ) : (
                selectedProject?.commits?.map((c, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-4 mb-3 rounded-xl bg-gray-100 dark:bg-[#0f172a] card-hover"
                  >
                    <div>
                      <p>{c.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(c.commit_date)}
                      </p>
                    </div>

                    <a
                      href={c.commit_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 text-xs"
                    >
                      View →
                    </a>
                  </div>
                ))
              )}
            </div>

           <div className="p-5 h-[30vh] rounded-xl border bg-white dark:bg-[#1e293b] border-gray-200 dark:border-slate-700">

              <h3 className="mb-4 font-semibold text-lg">Project Summary</h3>

              {/* GRID STATS */}
              <div className="grid grid-cols-2 gap-4 mb-4">

                {/* PROJECTS */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-[#0f172a] flex items-center justify-between card-hover">
                  <div>
                    <p className="text-xs text-gray-500">Projects</p>
                    <p className="text-xl font-bold">{data.total_projects}</p>
                  </div>
                  <span className="text-2xl">📁</span>
                </div>

                {/* COMMITS */}
                <div className="p-4 rounded-lg bg-green-50 dark:bg-[#0f172a] flex items-center justify-between card-hover">
                  <div>
                    <p className="text-xs text-gray-500">Commits</p>
                    <p className="text-xl font-bold">{totalCommits}</p>
                  </div>
                  <span className="text-2xl">✅</span>
                </div>

              </div>

              {/* EXTRA INSIGHTS */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>🔥 Active Project: {selectedProject?.project_name}</p>
              </div>

            </div>
          </div>

          {/* PROJECT GRID */}
          <div>
            <h3 className="mb-4 font-semibold">Github Projects</h3>

            <div className="grid grid-cols-3 gap-4">
              {data.projects.map((p, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedProject(p);

                    const today = new Date().toISOString().split("T")[0];

                    setDate(today);
                    localStorage.setItem("selectedDate", today);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer 
                    bg-white dark:bg-[#1e293b] border-gray-200 dark:border-slate-700
                    ${selectedProject?.project_id === p.project_id ? "ring-2 ring-blue-500" : ""}
                  `}
                >
                  <h4 className="font-semibold">{p.project_name}</h4>
                  <p className="text-sm text-gray-500">
                    Commits: {p.commits?.length || 0}
                  </p>

                  <a
                    href={p.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 text-sm"
                  >
                    View Repo →
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}