"use client";

import { useEffect, useState } from "react";
import { authAPI } from "../services/authAPI";
import { useSortableData } from "../hooks/sortableData";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { ExternalLink, Download } from "lucide-react";

export default function JobApplicationsView({ candidateId, date }) {

  const [toast, setToast] = useState(null);
  const [data, setData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    company: "",
    role: "",
    job_link: "",
    applied_via: "",
    employment_type: "",
    experience: "",
    ats_score: ""
  });

  /* ================= FETCH ================= */
  const fetchData = async () => {
    if (!candidateId) return;

    const res = await authAPI.getJobApplications(candidateId, date);
    const parsed =
      typeof res.body === "string" ? JSON.parse(res.body) : res;

    setData(parsed);
  };

  useEffect(() => {
    if (!candidateId || !date) return;

    fetchData();

    const stored = localStorage.getItem("selectedCandidate");
    if (stored) setSelectedCandidate(JSON.parse(stored));
  }, [candidateId, date]);

  const { sortedItems } = useSortableData(data?.applications || []);

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

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };


  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-2">

      {/* TOAST */}
      {toast && (
        <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER (NO BACK, NO ADD BUTTON) */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          {selectedCandidate?.first_name || "Candidate"} – Job Applications
        </h1>

        <p className="text-sm text-[var(--text-secondary)]">
          {week.start} → {week.end}
        </p>
      </div>

      {/* EMPTY */}
      {sortedItems.length === 0 && (
        <div className="empty-box">
          <p className="text-lg font-medium">No Applications Found</p>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {sortedItems.map((j, i) => {
          const isExpanded = expandedId === i;

          return (
            <div key={i} className="p-5 rounded-2xl bg-[var(--card)] card-hover">

              {/* TOP */}
              <div className="flex justify-between items-center">

                <div>
                  <p className="font-semibold text-lg">{j.job_title}</p>
                  <p className="text-sm text-gray-400">{j.company_name}</p>
                </div>

                <div className="flex items-center gap-4">

                  <span className="text-green-400 text-sm">
                    {j.application_date}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs bg-yellow-400/20 text-yellow-300">
                    {j.approval_status || "Pending"}
                  </span>

                  <button
                    onClick={() => toggleExpand(i)}
                    className="p-2 hover:bg-[var(--bg-secondary)] rounded"
                  >
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </button>

                </div>
              </div>

              {/* EXPANDED */}
              {isExpanded && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm border-t pt-4">

                  <div>
                    <p className="text-gray-400">Applied Via</p>
                    <p>{j.applied_via}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Employment</p>
                    <p>{j.employment_type}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Experience</p>
                    <p>{j.experience}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">ATS Score</p>
                    <p>{j.ats_score}</p>
                  </div>

                  <div className="col-span-2 flex gap-3 mt-3">
                    <button
                      onClick={() => window.open(j.application_link, "_blank")}
                      className="px-4 py-2 btn-blue flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      View
                    </button>

                    <button
                      onClick={() => window.open(j.resume_s3_url, "_blank")}
                      className="px-4 py-2 btn-green flex items-center gap-2"
                    >
                      <Download size={16} />
                      Resume
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL (kept same UI) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] w-full max-w-2xl rounded-2xl p-6">

            <h2 className="text-xl mb-4">
              {editJob ? "Edit Job Application" : "Add Job"}
            </h2>

            {/* form same as before (kept minimal here) */}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleSubmit} className="btn-blue">
                Submit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}