"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { authAPI } from "../services/authAPI";
import { useRouter } from "next/router";

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
  const goToDetails = (c) => {
    localStorage.setItem("selectedCandidate", JSON.stringify(c));
    router.push(`/candidate_details?id=${c.jaa_candidate_id}`);
  };

  //////////////////////////////////////////////////////
  // LOADER
  //////////////////////////////////////////////////////
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B1120] text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] text-white p-8">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl text-[var(--text)] font-semibold">
          Candidates ({candidates.length})
        </h1>
        <p className="text-sm text-gray-400">
          Manage and view all registered candidates
        </p>
      </div>

      {/* EMPTY STATE */}
      {candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">

          <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-gray-800 text-3xl">
            👤
          </div>

          <h2 className="text-xl font-semibold">
            No Candidates Found
          </h2>

          <p className="text-sm text-gray-400 mt-2 max-w-sm">
            Once candidates are added, they will appear here.
          </p>

        </div>
      ) : (

        <div className="space-y-4">

          {candidates.map((c) => {
            const isActive =
              selectedCandidate?.jaa_candidate_id === c.jaa_candidate_id;

            return (
              <div
                key={c.jaa_candidate_id}
                onClick={() => setSelectedCandidate(c)}
                className={`
                  p-5 rounded-2xl cursor-pointer transition-all duration-200
                  border border-transparent
                  bg-[var(--card)] card-hover
                `}
              >
                <div className="flex justify-between items-center">

                  {/* LEFT */}
                  <div className="flex gap-4">

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-lg">
                      {c.first_name?.[0]}
                    </div>

                    {/* Info */}
                    <div>
                      <p className="font-semibold">
                        {c.first_name} {c.last_name}
                      </p>
                      <p className="text-sm text-gray-400">{c.email}</p>

                      <p className="text-xs text-gray-500">
                        {c?.address?.city} • {c?.address?.state}
                      </p>

                      <p className="text-xs text-gray-500">
                        📞 {c.phone}
                      </p>
                    </div>

                  </div>

                  {/* RIGHT */}
                  {c?.address?.country && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin size={16} />
                      <span>{c.address.country}</span>
                    </div>
                  )}

                </div>

                {/* ACTION */}
                <div className="mt-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToDetails(c);
                    }}
                    className="
                      px-4 py-1.5 text-sm rounded-lg
                      bg-[#6366f1]/20 text-[#6366f1]
                      hover:bg-[#6366f1]/30
                      transition
                    "
                                >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}