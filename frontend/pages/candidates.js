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
          <button
            onClick={() => router.back()}
            className="px-3 py-1.5 rounded-lg text-white btn-blue"
          >
            ← Back
          </button>

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

          {candidates.map((c) => (
            <div
              key={c.jaa_candidate_id}
              onClick={() => setSelectedCandidate(c)}
              className="
                relative
                px-4 py-2 pt-4 
                rounded-2xl cursor-pointer transition-all duration-200
                border border-transparent card-hover
                bg-[var(--card)]
              "
            >

              {/* ✅ LAST LOGIN (TOP RIGHT) */}
              <div className="absolute top-3 right-4 flex items-center gap-2 text-xs">
                <span className="text-gray-400">Last Login:</span>

                <span className="
                  px-2.5 py-0.5 rounded-full 
                  bg-gray-700/50 
                  text-gray-200 font-medium
                ">
                  {c?.last_login
                    ? new Date(c.last_login).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Never"}
                </span>
              </div>

              <div className="flex items-start">

                {/* LEFT */}
                <div className="flex gap-4">

                  {/* Avatar */}
                  <div className="
                    w-11 h-11 rounded-xl
                    flex items-center justify-center
                    font-bold text-sm text-white
                    bg-gradient-to-br from-purple-500 via-pink-500 to-pink-400
                  ">
                    {c.first_name?.[0]}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-semibold">
                      {c.first_name} {c.last_name}
                    </p>

                    <p className="text-xs text-[var(--text-secondary)]">
                      {c.email}
                    </p>

                    {/* Address + Location */}
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span>
                        {c?.address?.city} • {c?.address?.state}
                      </span>

                      {c?.address?.country && (
                        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <MapPin size={12} className="text-[var(--primary)]" />
                          {c.address.country}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)]">
                      📞 {c.phone}
                    </p>
                  </div>

                </div>

              </div>

              {/* ACTION */}
              <div className="mt-3 text-right">
                <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToDetails(c);
                      }}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      View Details
                    </button>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}