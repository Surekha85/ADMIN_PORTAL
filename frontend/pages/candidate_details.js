"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import JobApplicationsView from "../components/JobApplicationsView";
import LinkedinView from "../components/LinkedinView";
import GithubActivitiesView from "../components/GithubActivitiesView";
import ProfileView from "../components/ProfileView";
import Portfolio from "../components/Portfolio";

export default function CandidateDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState("applications");

  if (!id) return null; // ✅ prevent undefined

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
      <div className="flex justify-between items-center mb-6">

        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-lg text-white btn-blue"
        >
          ← Back
        </button>

        <h1 className="text-xl font-semibold">
          Details of {id}
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
          <div>Portfolio UI pending</div>
        )}

      </div>
    </div>
  );
}