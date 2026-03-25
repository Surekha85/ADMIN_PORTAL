"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "../services/authAPI";
import JobApplicationsView from "../components/JobApplicationsView";
import LinkedinView from "../components/LinkedinView";
import GithubActivitiesView from "../components/GithubActivitiesView";
import ProfileView from "../components/ProfileView";
import PortfolioView from "../components/PortfolioView";

export default function CandidateDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState("profile");
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        // ✅ API CALL
        const res = await authAPI.getCandidateProfile(id);

        const parsed =
          res?.body && typeof res.body === "string"
            ? JSON.parse(res.body)
            : res;

        localStorage.setItem(
          "selectedCandidate",
          JSON.stringify(parsed) 
        );

        setCandidate(parsed);
      } catch (err) {
        console.error("Error fetching candidate:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  // SAFE GUARDS
  if (!id) return null;

  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading candidate details...
      </div>
    );
  }

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
      <div className="flex items-center gap-4 mb-6">
        <Link href="/candidates" className="relative group">
          <span className="btn-back hover">
            <ArrowLeft size={16} />
            Back to Candidates
          </span>
        </Link>
        

        <h1 className="text-xl font-semibold">
          Details of{" "}
          {candidate?.first_name || "-"}{" "}
          {candidate?.last_name || ""}
        </h1>

        <div />
      </div>

      {/* TABS */}
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

        {activeTab === "profile" && (
          <ProfileView candidateId={id} />
        )}

        {activeTab === "applications" && (
          <JobApplicationsView candidateId={id} />
        )}

        {activeTab === "linkedin" && (
          <LinkedinView candidateId={id} />
        )}

        {activeTab === "github" && (
          <GithubActivitiesView candidateId={id} />
        )}

        {activeTab === "portfolio" && (
          <PortfolioView candidateId={id} />
        )}

      </div>
    </div>
  );
}