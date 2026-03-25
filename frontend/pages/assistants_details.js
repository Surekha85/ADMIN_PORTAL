"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "../services/authAPI";

import JobApplicationsView from "../components/JobApplicationsView";
import LinkedinView from "../components/LinkedinView";
import GithubActivitiesView from "../components/GithubActivitiesView";
import ProfileView from "../components/ProfileView";
import Portfolio from "../components/PortfolioView";

export default function AssistantDetails() {
  const router = useRouter();
  const { id } = router.query; // assistant ID

  const [activeTab, setActiveTab] = useState("profile");
  const [candidates, setCandidates] = useState([]);
  const [assistant, setAssistant] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCandidateData, setSelectedCandidateData] = useState(null);

  const scrollRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);

  //////////////////////////////////////////////////////
  // SCROLL LOGIC
  //////////////////////////////////////////////////////
  useEffect(() => {
    const checkOverflow = () => {
      if (!scrollRef.current) return;

      const el = scrollRef.current;

      setShowArrows(el.scrollWidth > el.clientWidth);
    };

    checkOverflow();

    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [candidates]);
  //////////////////////////////////////////////////////
  // LOAD ASSISTANT + CANDIDATES
  //////////////////////////////////////////////////////
  useEffect(() => {
    const stored = localStorage.getItem("selectedAssistant");

    if (stored) {
      const parsed = JSON.parse(stored);
      setAssistant(parsed);

      const ids = parsed.assigned_candidates || [];
      setCandidates(ids);

      // ✅ Auto select first candidate
      if (ids.length > 0) {
        setSelectedCandidate(ids[0]);
      }
    }
  }, []);

  // FETCH SELECTED CANDIDATE DATA
  useEffect(() => {
    if (!selectedCandidate) return;

    const fetchCandidate = async () => {
      try {
        // 1. CHECK LOCAL STORAGE FIRST
        const stored = localStorage.getItem("selectedCandidate");
        if (stored) {
          const parsedStored = JSON.parse(stored);
          if (parsedStored?.id == selectedCandidate) {
            setSelectedCandidateData(parsedStored);
            return;
          }
        }

        // 2. API CALL
        const res = await authAPI.getCandidateProfile(selectedCandidate);

        const parsed =
          res?.body && typeof res.body === "string"
            ? JSON.parse(res.body)
            : res;

        setSelectedCandidateData(parsed);
        localStorage.setItem(
          "selectedCandidate",
          JSON.stringify(parsed)
        );

      } catch (err) {
        console.error("Error fetching candidate:", err);
      }
    };

    fetchCandidate();
  }, [selectedCandidate]);

  //////////////////////////////////////////////////////
  // HANDLERS
  //////////////////////////////////////////////////////
  const handleCandidateClick = (candidateId) => {
    setSelectedCandidate(candidateId);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  if (!id) return null;

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "applications", label: "Applications" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "github", label: "GitHub" },
    { key: "portfolio", label: "Portfolio" },
  ];

  return (
    <div className="min-h-screen p-6 bg-[var(--bg)] text-[var(--text)]">

      {/* HEADER */}
<div className="flex items-center justify-between mb-6">

  {/* LEFT SIDE */}
  <div className="flex items-center gap-4">

    <Link href="/assistants" className="relative group">
      <span className="btn-back hover flex items-center gap-2">
        <ArrowLeft size={16} />
        Back to Assistants
      </span>
    </Link>

    {/* CANDIDATE INFO */}
    <div className="flex items-center gap-3">
      {/* Name + Label */}
      <div>
        <p className="text-sm">
          Details of {selectedCandidateData?.first_name || "-"} {selectedCandidateData?.last_name || ""}
        </p>
      </div>

    </div>
  </div>

  {/* RIGHT SIDE → ASSISTANT */}
  <div className="flex items-center gap-3">

    {/* Assistant Avatar */}
    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
      {assistant?.first_name?.[0] || "A"}
    </div>

    <div>
      <p className="text-xs text-gray-400">
        Assistant
      </p>
      <p className="text-sm font-medium">
        {assistant?.first_name} {assistant?.last_name}
      </p>
    </div>

  </div>

</div>

      {/* CANDIDATE SCROLLER */}
      <div className="flex items-center gap-2 mb-6">

  {/* LEFT ARROW SPACE */}
        {showArrows ? (
    <button
      onClick={scrollLeft}
      className="flex-shrink-0 h-9 w-9 flex items-center justify-center
      rounded-full border border-[var(--border)]
      bg-[var(--card)] hover:bg-[var(--bg-secondary)]"
    >
            ←
          </button>
        ) : (
    <div className="w-9" /> // keeps spacing consistent
        )}

  {/* SCROLL LIST */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-hide"
        >
          {candidates.map((cid, index) => (
            <button
              key={cid || index}
              onClick={() => handleCandidateClick(cid)}
        className={`
          px-4 py-1.5 text-sm font-medium rounded-full border whitespace-nowrap transition

          ${
                selectedCandidate === cid
              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
          }
        `}
            >
              {cid}
            </button>
          ))}
        </div>

  {/* RIGHT ARROW SPACE */}
        {showArrows ? (
    <button
      onClick={scrollRight}
      className="flex-shrink-0 h-9 w-9 flex items-center justify-center
      rounded-full border border-[var(--border)]
      bg-[var(--card)] hover:bg-[var(--bg-secondary)]"
    >
            →
          </button>
        ) : (
          <div className="w-9" />
        )}

      </div>

      <div className="grid grid-cols-5 border-b border-[var(--border)] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 text-center w-full transition ${
              activeTab === tab.key
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)] bg-[var(--bg-secondary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--border)]">

        {!selectedCandidate ? (
          <div className="text-center text-gray-400">
            No candidate selected
          </div>
        ) : (
          <>
            {activeTab === "profile" && (
              <ProfileView candidateId={selectedCandidate}  key={selectedCandidate}/>
            )}

            {activeTab === "applications" && (
              <JobApplicationsView candidateId={selectedCandidate} key={selectedCandidate} />
            )}

            {activeTab === "linkedin" && (
              <LinkedinView candidateId={selectedCandidate} key={selectedCandidate}/>
            )}

            {activeTab === "github" && (
              <GithubActivitiesView candidateId={selectedCandidate} key={selectedCandidate}/>
            )}

            {activeTab === "portfolio" && (
              <Portfolio candidateId={selectedCandidate} key={selectedCandidate} />
            )}
          </>
        )}
      </div>
    </div>
  );
}