"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "../services/authAPI";
import { useRouter } from "next/router";
import Link from "next/link";
import { Pencil } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";


export default function CandidatesPage() {
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(true);

  //////////////////////////////////////////////////////
  // LOAD DATA
  //////////////////////////////////////////////////////

  const loadCandidates = async () => {
  try {
    let res = await authAPI.getCandidates();

    if (res?.body) res = JSON.parse(res.body);

    let parsed = [];

    if (typeof res?.candidates === "string") {
      parsed = JSON.parse(res.candidates);
    } else if (Array.isArray(res?.candidates)) {
      parsed = res.candidates;
    }

    setCandidates(parsed);

  } catch (e) {
    console.error(e);
  }
};

const loadAssistants = async () => {
  try {
    let ares = await authAPI.getAssistants();

    if (ares?.body) ares = JSON.parse(ares.body);

    let parsedAssistants = [];

    if (typeof ares?.assistants === "string") {
      parsedAssistants = JSON.parse(ares.assistants);
    } else if (Array.isArray(ares?.assistants)) {
      parsedAssistants = ares.assistants;
    }

    setAssistants(parsedAssistants);

  } catch (e) {
    console.error(e);
  }
};

  useEffect(() => {
    const load = async () => {
      await loadCandidates();
      await loadAssistants();
      setLoading(false);
    };

    load();
  }, []);

  //////////////////////////////////////////////////////
  // NAVIGATION
  //////////////////////////////////////////////////////
  const goToDetails = (a) => {
    localStorage.setItem("selectedCandidate", JSON.stringify(a));
    router.push(`/candidate_details?id=${a.jaa_candidate_id}`);
  };

  const handleAssign = async (assistant) => {
  try {

    const res = await authAPI.assignAssistant({
      candidateId: selectedCandidate.jaa_candidate_id,
      assistantId: assistant.assistantId
    });

    // ✅ Handle API Gateway body
    let data = res;
    if (res?.body) {
      data = JSON.parse(res.body);
    }

    // ✅ SHOW SUCCESS TOAST
    toast.success(data?.message || "Assistant assigned successfully");

    setShowAssignModal(false);

    // ✅ REFRESH DATA
    await loadCandidates();

  } catch (e) {
    console.error("Assign error:", e);

    // ✅ ERROR TOAST
    toast.error(e?.message || "Failed to assign assistant");
  }
};

  //////////////////////////////////////////////////////
  // LOADER
  //////////////////////////////////////////////////////
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B1120]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        Loading...
      </div>
    );
  }


  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href='/dashboard' className="relative group">
            <span className="btn-back hover">
              <ArrowLeft size={16} />
              Back to Dashboard
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">
              Candidates ({candidates.length})
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              View all registered candidates
            </p>
          </div>
        </div>
      </div>

      {/* EMPTY */}
      {candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-gray-800 text-3xl">
            👤
          </div>

          <h2 className="text-xl font-semibold">No Candidates Found</h2>

          <p className="text-sm text-gray-400 mt-2 max-w-sm">
            Once candidates are added, they will appear here.
          </p>
        </div>
      ) : (

        <div className="space-y-3">

          {candidates.map((a) => {
            const assignedList = a.assignedAssistants || [];
            const maxVisible = 3;
            const visible = assignedList.slice(0, maxVisible);
            const remaining = assignedList.length - maxVisible;

            return (
              <div
                key={a.jaa_candidate_id}
                className="p-5 rounded-2xl cursor-pointer bg-[var(--card)] card-hover"
              >
                <div className="grid grid-cols-[1fr_150px_180px] items-center">

                  {/* LEFT */}
                  <div className="flex gap-4 items-center">

                    {/* Avatar */}
                    <div className="
                      w-12 h-12 rounded-xl
                      flex items-center justify-center
                      font-bold text-lg text-white
                      bg-gradient-to-br from-purple-500 via-pink-500 to-pink-400
                    ">
                      {a.first_name?.[0]}
                    </div>

                    {/* Info */}
                    <div>
                      <p className="font-semibold">
                        {a.first_name} {a.last_name}
                      </p>

                      <p className="text-sm text-[var(--text-secondary)]">
                        {a.email}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        User Id: {a.user_id}
                      </p>

                      <p className="text-xs text-[var(--text-secondary)]">
                        JAA Candidate Id: {a.jaa_candidate_id}
                      </p>
                    </div>
                  </div>

                  {/* MIDDLE */}
                  <div className="flex flex-col items-center relative">
                    <span className="text-xs text-[var(--text-secondary)]">
                      Assigned Assistants
                    </span>

                    {assignedList.length > 0 ? (
                      <div className="flex items-center mt-1">
                        {/* AVATAR STACK */}
                        <div className="flex -space-x-2" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(a);
                            setShowAssignModal(true);
                          }}>
                          {visible.map((asst, i) => (
                            <div
                              key={asst.assistantId}
                              title={asst.assistantName}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs flex items-center justify-center border-2 border-[#0B1120] shadow"
                            >
                              {asst.assistantName[0]}
                            </div>
                          ))}

                          {/* +N BUTTON */}
                          {remaining > 0 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCandidate(a);
                                setShowAssignModal(true);
                              }}
                              className="w-8 h-8 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center border-2 border-[#0B1120] cursor-pointer hover:bg-gray-500"
                            >
                              +{remaining}
                            </div>
                          )}
                        </div>

                        {/* EDIT ICON */}
                        {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(a);
                            setShowAssignModal(true);
                          }}
                          className="ml-2"
                        >
                          <Pencil size={14} className="text-gray-400 hover:text-white" />
                        </button> */}

                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(a);
                          setShowAssignModal(true);
                        }}
                        className="text-sm text-blue-400 underline"
                      >
                        + Assign
                      </button>
                    )}

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-2">

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--text-secondary)]">
                        Created On:
                      </span>

                      {a.createdAt ? (
                        <span className="text-[var(--text)] font-medium">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-secondary)]">
                          Never
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToDetails(a);
                      }}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      View Details
                    </button>

                  </div>

                </div>
              </div>
            );
          })}

        </div>
      )}
      {/* MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-[var(--card)] p-6 rounded-xl w-[600px] ">

            <h2 className="text-lg font-semibold mb-4">
              Assign Assistant to{" "}
              <span className="text-[var(--primary)]">
                {selectedCandidate?.first_name}
              </span>
            </h2>

            <div className="space-y-2 max-h-[300px] overflow-y-auto overflow-x-hidden">

              {assistants.map((a) => {
                const isAssigned = selectedCandidate?.assignedAssistants?.some(
                  (x) => x.assistantId === a.assistantId
                );

                return (
                  <div
                    key={a.assistantId}
                    className="p-3 border rounded-lg flex justify-between items-center card-hover"
                  >
                    <div>
                      <p className="font-medium">
                        {a.first_name} {a.last_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {a.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {a.assistantId}
                      </p>
                    </div>

                    {/* 🔥 CONDITIONAL BUTTON */}
                    {isAssigned ? (
                      <button
                        onClick={() => handleAssign(a)}
                        className="text-sm bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssign(a)}
                        className="text-sm bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                );
              })}

            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-[var(--border)] rounded"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      <Toaster position="top-right" />
      
    </div>
  );
}
