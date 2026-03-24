"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "../services/authAPI";
import { useRouter } from "next/router";
import Link from "next/link";

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
  useEffect(() => {
    const load = async () => {
      try {
        let res = await authAPI.getCandidates();

        if (res?.body) res = JSON.parse(res.body);

        // ✅ FIX: string → array
        let parsed = [];

        if (typeof res?.candidates === "string") {
          parsed = JSON.parse(res.candidates);
        } else if (Array.isArray(res?.candidates)) {
          parsed = res.candidates;
        }

        setCandidates(parsed);

        // 🔥 Load assistants also
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
      } finally {
        setLoading(false);
      }
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
      // 🔥 CALL API
      await authAPI.assignAssistant({
        candidateId: selectedCandidate.jaa_candidate_id,
        assistantId: assistant.assistantId
      });

      // ✅ UPDATE UI AFTER SUCCESS
      setCandidates(prev =>
        prev.map(c =>
          c.jaa_candidate_id === selectedCandidate.jaa_candidate_id
            ? { ...c, assignedAssistant: assistant }
            : c
        )
      );

      setShowAssignModal(false);

    } catch (e) {
      console.error("Assign error:", e);
      alert("Failed to assign assistant");
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
            const assigned =
              a.assistantAssignedTo  || null;

            return (
              <div
                key={a.jaa_candidate_id}
                className="p-5 rounded-2xl cursor-pointer bg-[var(--card)]"
              >
                <div className="grid grid-cols-[1fr_150px_180px] items-center">

                  {/* LEFT */}
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-purple-500 via-pink-500 to-pink-400">
                      {a.first_name?.[0]}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {a.first_name} {a.last_name}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {a.email}
                      </p>
                    </div>
                  </div>

                  {/* MIDDLE */}
                  <div className="flex flex-col items-start pl-4">

                    <span className="text-xs text-[var(--text-secondary)]">
                      Assigned Assistant
                    </span>

                    {assigned ? (
                      <span className="text-green-500 font-semibold">
                        {a.first_name} {a.last_name}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(a);
                          setShowAssignModal(true);
                        }}
                        className="text-sm text-blue-400 underline"
                      >
                        + Assign Assistant
                      </button>
                    )}

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
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

          <div className="bg-[var(--card)] p-6 rounded-xl w-[400px]">

            <h2 className="text-lg font-semibold mb-4">
              Assign Assistant to{" "}
              <span className="text-[var(--primary)]">
                {selectedCandidate?.first_name}
              </span>
            </h2>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">

              {assistants.map((a) => (
                <div
                  key={a.assistantId}
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {a.first_name} {a.last_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.email}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAssign(a)}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Assign
                  </button>
                </div>
              ))}

            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-gray-700 rounded"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}