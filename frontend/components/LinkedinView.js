"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, ArrowLeft } from "lucide-react";
import { authAPI } from "../services/authAPI";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { ExternalLink } from "lucide-react";

const taskTypeStyles = {
  PROFILE: "bg-[var(--profile)]/10 text-[var(--profile)]",
  POST: "bg-[var(--post)]/10 text-[var(--post)]",
  OUTREACH: "bg-[var(--outreach)]/10 text-[var(--outreach)]",
  TIPS: "bg-[var(--tips)]/10 text-[var(--tips)]",
};

export default function LinkedInActivities({ candidateId }) {

  const [tasks, setTasks] = useState([]);
  const [modalHeight, setModalHeight] = useState("auto");
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [linkedinTasks, setLinkedinTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const getTaskIcon = (type) => {
    switch (type) {
      case "TIPS":
        return "💡";
      case "PROFILE":
        return "👤";
      case "POST":
        return "✍️";
      case "OUTREACH":
        return "📩";
      default:
        return "📌";
    }
  };

  useEffect(() => {
    const calculateHeight = () => {
      const navbar = document.getElementById("app-navbar");
      const navbarHeight = navbar?.offsetHeight || 0;

      const screenHeight = window.innerHeight;

      const finalHeight =
        screenHeight - navbarHeight - screenHeight * 0.05;

      setModalHeight(finalHeight);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    if (candidateId) {
      fetchLinkedinTasks(selectedDate); // 🔥 call API
    }
  };

  useEffect(() => {
    if (!candidateId) return;

    const today = new Date().toISOString().split("T")[0];
    fetchLinkedinTasks(today);
  }, [candidateId]);

  const fetchLinkedinTasks = async (date) => {
    try {
      setLoading(true);

      // ✅ CLEAR OLD DATA FIRST
      setLinkedinTasks([]);

      const res = await authAPI.getLinkedinActivities(candidateId, date);

      const parsed =
        typeof res.body === "string" ? JSON.parse(res.body) : res;

      // ✅ HANDLE NO DATA RESPONSE
      if (!parsed.activities || parsed.activities.length === 0) {
        setLinkedinTasks([]); // force empty
        return;
      }

      setLinkedinTasks(parsed.activities);
    } catch (err) {
      console.error("❌ FETCH ERROR:", err);

      setLinkedinTasks([]); // ✅ clear on error also

      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        JSON.stringify(err);

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= KPI ================= */
  const total = linkedinTasks.length;

  const dueToday = linkedinTasks.filter(
    (t) => t.due_date === today && t.status === "DUE"
  ).length;

  const inProgress = linkedinTasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;

  const completed = linkedinTasks.filter(
    (t) => t.status === "COMPLETED"
  ).length;

  /* ================= GROUP ================= */
  const getDayIndex = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 0 ? 6 : day - 1;
  };

  const groupedTasks = Array(7)
    .fill(null)
    .map(() => []);

  linkedinTasks.forEach((task) => {
    if (!task.due_date) return;
    const index = getDayIndex(task.due_date);
    groupedTasks[index].push(task);
  });

  return (
    <div className="min-h-screen p-6 bg-[var(--bg)] text-[var(--text)] p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 sticky top-[64px] z-10 bg-[var(--bg-primary)] pb-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              LinkedIn Activities of {candidateId}
            </h1>
            <p className="text-sm text-gray-400">
              {week.start} → {week.end}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="p-2 rounded border"
          />
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: total },
          { label: "Due Today", value: dueToday },
          { label: "In Progress", value: inProgress },
          { label: "Completed", value: completed },
        ].map((item) => (
          <div className="bg-[var(--bg-secondary)] p-5 rounded-xl border border-[var(--border-color)]">
            <p className="text-gray-400 text-sm">{item.label}</p>
            <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center mt-20 text-gray-400">
          Loading activities...
        </div>
      )}

      {/* EMPTY STATE (PRO UI) */}
      {!loading && linkedinTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-24">

          {/* ICON */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 animate-float">
            <span className="text-3xl">📭</span>
          </div>

          {/* TITLE */}
          <h2 className="text-2xl font-semibold mb-2">
            No LinkedIn Activities Found
          </h2>

          {/* SUBTEXT */}
          <p className="text-gray-400 text-sm max-w-md text-center">
            There are no activities scheduled for this selected date or week.
          </p>
        </div>
      )}

      {/* LIST VIEW */}
      {!loading && linkedinTasks.length > 0 && (
        <div className="space-y-4">
          {linkedinTasks.map((task, i) => {
            const isExpanded = expandedId === i;

            return (
              <div
                key={task.task_id}
                className="p-5 rounded-2xl bg-[var(--card)] card-hover"
              >

                {/* TOP */}
                <div className="flex justify-between items-center">

                  {/* LEFT */}
                  <div>
                    <p className="font-semibold text-lg">{task.title}</p>
                    <p className="text-sm text-gray-400">
                      {task.task_type}
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3">

                    {/* STATUS */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${task.status === "COMPLETED"
                          ? "bg-green-400/20 text-green-300"
                          : task.status === "IN_PROGRESS"
                            ? "bg-blue-400/20 text-blue-300"
                            : "bg-yellow-400/20 text-yellow-300"
                        }`}
                    >
                      {task.status}
                    </span>

                    {/* EXPAND BUTTON */}
                    <button
                      onClick={() => toggleExpand(i)}
                      className="p-2 rounded-md hover:bg-[var(--bg-secondary)]"
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* EXPANDED SECTION */}
                {isExpanded && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm border-t pt-4">

                    <div>
                      <p className="text-gray-400">Due Date</p>
                      <p>
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString("en-GB")
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400">Created At</p>
                      <p>
                        {task.created_at
                          ? new Date(task.created_at).toLocaleDateString("en-GB")
                          : "-"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-gray-400">What to do</p>
                      <p className="leading-relaxed">
                        {task.what_to_do || "-"}
                      </p>
                    </div>

                    {/* TYPE BASED CONTENT */}

                    {task.task_type === "TIPS" && (
                      <div className="col-span-2">
                        <p className="text-gray-400">Tips</p>
                        <p>{task.tips_content}</p>
                      </div>
                    )}

                    {task.task_type === "POST" && (
                      <div className="col-span-2">
                        <p className="text-gray-400">Post Content</p>
                        <p>{task.copy_paste_content}</p>
                      </div>
                    )}

                    {task.task_type === "PROFILE" && (
                      <div className="col-span-2">
                        <p className="text-gray-400">Profile Content</p>
                        <p>{task.copy_paste_content}</p>
                      </div>
                    )}

                    {task.task_type === "OUTREACH" && (
                      <div className="col-span-2">
                        <p className="text-gray-400">Message</p>
                        <p>{task.copy_paste_content}</p>

                        {task.linkedin_profile_url && (
                          <button
                            onClick={() =>
                              window.open(task.linkedin_profile_url, "_blank")
                            }
                            className="px-4 py-2 rounded text-white btn-blue flex items-center gap-2"
                          >
                            <ExternalLink size={16} />
                            View on LinkedIn
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}