"use client";

import { useEffect, useState } from "react";
import { authAPI } from "../services/authAPI";
import { useSortableData } from "../hooks/sortableData";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Target,
  Zap,
  ExternalLink,
  Download
} from "lucide-react";

export default function JobApplicationsView({ candidateId }) {
  const today = new Date().toISOString().split("T")[0];
  const [data, setData] = useState(null);
  const [date, setDate] = useState(today);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [toast, setToast] = useState(null);
  const [showQA, setShowQA] = useState(true);

  //////////////////////////////////////////////////////
  // LOAD DATA
  //////////////////////////////////////////////////////
  const fetchData = async () => {
    if (!candidateId) return;

    try {
      const res = await authAPI.getJobApplications(candidateId, date);

      const parsed =
        typeof res?.body === "string" ? JSON.parse(res.body) : res;

      setData(parsed);
    } catch (e) {
      console.error(e);
      showToast("Failed to load applications ❌");
    }
  };
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

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    if (candidateId) {
      fetchLinkedinTasks(selectedDate); // 🔥 call API
    }
  };

  useEffect(() => {
    fetchData();

    const stored = localStorage.getItem("selectedCandidate");
    if (stored) {
      try {
        setSelectedCandidate(JSON.parse(stored));
      } catch {}
    }
  }, [candidateId, date]);

  const { sortedItems } = useSortableData(data?.applications || []);

  //////////////////////////////////////////////////////
  // HELPERS
  //////////////////////////////////////////////////////
  const getColor = (score) => {
    if (score < 70) return "text-red-400 bg-red-400/20";
    if (score < 85) return "text-yellow-400 bg-yellow-400/20";
    return "text-green-400 bg-green-400/20";
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  //////////////////////////////////////////////////////
  // DOWNLOAD
  //////////////////////////////////////////////////////
  const handleDownload = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const ext = url.split(".").pop().split("?")[0];

      const name = `${selectedCandidate?.first_name || "candidate"}_${selectedCandidate?.last_name || ""}`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${name}_resume.${ext}`;
      link.click();

    } catch (e) {
      console.error(e);
      showToast("Download failed ❌");
    }
  };

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="min-h-screen p-6 bg-[var(--bg)] text-[var(--text)]">

      {toast && (
        <div className="mb-4 text-red-400">{toast}</div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>
            <h1 className="text-2xl font-semibold">
              Job Applications
            </h1>
            <p className="text-sm text-gray-400">
              {week.start} → {week.end}
            </p>
          </div>

        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--card)] border"
        />
      </div>

      {/* EMPTY */}
      {/* EMPTY STATE (PRO UI) */}
      {sortedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-24">

          {/* ICON */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 animate-float">
            <span className="text-3xl">📭</span>
          </div>

          {/* TITLE */}
          <h2 className="text-2xl font-semibold mb-2">
            No Job Applications Found
          </h2>

          {/* SUBTEXT */}
          <p className="text-gray-400 text-sm max-w-md text-center">
            There are no applications scheduled for this selected date or week.
          </p>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">

        {sortedItems.map((j, i) => {
          const isExpanded = expandedId === i;

          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[var(--card)] shadow-md
              hover:shadow-xl hover:scale-[1.02] hover:bg-[var(--bg-secondary)]
              transition-all duration-200 cursor-pointer"
            >

              {/* TOP */}
              <div className="flex justify-between items-center">

                <div>
                  <p className="font-semibold text-lg">{j.job_title}</p>
                  <p className="text-sm text-gray-400">
                    {j.company_name}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap items-center">

                  <span className={` flex items-center gap-1 px-3 py-1 text-xs rounded-full ${getColor(j.ats_score)}`}>
                    <Target size={12} /> {j.ats_score || 0}%
                  </span>

                  <span className={` flex items-center gap-1 px-3 py-1 text-xs rounded-full ${getColor(100 - j.ai_detection_score)}`}>
                    <Zap size={12} /> AI {j.ai_detection_score || 0}%
                  </span>

                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-400/20 text-yellow-300">
                    {j.approval_status || "Pending"}
                  </span>

                  <button
                    onClick={() => toggleExpand(i)}
                    className="p-2 rounded-md hover:bg-[var(--bg-secondary)] transition"
                  >
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>

              {/* 🔥 EXPANDED SECTION (UNCHANGED STRUCTURE) */}
              {isExpanded && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm border-t pt-4">

                  <div>
                    <p className="text-gray-400">Applied Via</p>
                    <p>{j.applied_via || "-"}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Employment</p>
                    <p>{j.employment_type || "-"}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Experience</p>
                    <p>{j.experience || "-"}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">ATS Score</p>
                    <p>{j.ats_score || "-"}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">AI Detection</p>
                    <p>{j.ai_detection_score || "-"}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Status</p>
                    <p>{j.approval_status || "Pending"}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Application Date</p>
                    <p>{j.application_date || "-"}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Created At</p>
                    <p>{j.created_at ? j.created_at.split("T")[0] : "-"}</p>
                  </div>

                  <div className="col-span-2 flex items-center gap-3 mt-3 flex-nowrap">
                    <button
                      onClick={() => window.open(j.application_link, "_blank")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition whitespace-nowrap"
                    >
                      <ExternalLink size={16} />
                      <span>View Application</span>
                    </button>

                    <button
                      onClick={() => handleDownload(j.resume_s3_url)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition whitespace-nowrap"
                    >
                      <Download size={16} />
                      <span>Download Resume</span>
                    </button>

                  </div>

                  {j.questionsAndAnswers && j.questionsAndAnswers.length > 0 && (
                    <div className="col-span-2 mt-4">

                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400 text-sm">
                          Screening Questions & Answers
                        </p>

                        <button
                          onClick={() => setShowQA(!showQA)}
                          className="text-xs px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition"
                        >
                          {showQA ? "Hide" : "Show"}
                        </button>
                      </div>

                      {showQA && (
                        <div className="space-y-3">
                          {j.questionsAndAnswers.map((qa, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-gray-700"
                            >
                              <p className="text-xs text-gray-400 mb-1 text-red-400">
                                Question {idx + 1}
                              </p>
                              <p className="font-medium mb-2">
                                {qa.question}
                              </p>

                              <p className="text-xs text-gray-400 mb-1 text-green-400">
                                Answer
                              </p>
                              <p className="font-medium">
                                {qa.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
