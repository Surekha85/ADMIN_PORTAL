"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "../services/authAPI";
import { useRouter } from "next/router";
import Link from "next/link";

export default function CandidatesPage() {
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
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
        setSelectedCandidate(parsed[0] || null);

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

  //////////////////////////////////////////////////////
  // LOADER
  //////////////////////////////////////////////////////
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B1120]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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

          {candidates.map((a) => (
            <div
                key={a.candidateId}
                onClick={() => setSelectedAssistant(a)}
                className={`
                  p-5 rounded-2xl cursor-pointer transition-all duration-200
                  border border-transparent card-hover
                  bg-[var(--card)]
                `}
              >
                <div className="grid grid-cols-[1fr_120px_180px] items-center">

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
                        User ID: {a.user_id}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        JAA Candidate ID: {a.jaa_candidate_id}
                      </p>
                    </div>
                  </div>

                  {/* MIDDLE */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[var(--text-secondary)]">
                      Assgined Assistant
                    </span>

                    <span className="text-2xl font-bold text-[var(--primary)]">
                      {a.assigned_candidates?.length || 0}
                    </span>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-2">

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--text-secondary)]">
                        Created At:
                      </span>

                      <span className="text-[var(--text)] font-medium">
                          {new Date(a.createdAt).toLocaleDateString()}
                      </span>
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
          ))}

        </div>
      )}

    </div>
  );
}