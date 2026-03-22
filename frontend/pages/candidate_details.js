import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import JobApplicationsView from "../components/JobApplicationsView";
import LinkedinView from "../components/LinkedinView";
import GithubActivitiesView from "../components/GithubActivitiesView";
import Portfolio from "../components/Portfolio";

export default function CandidateDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState("applications");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  const tabs = [
    { key: "applications", label: "Applications" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "github", label: "GitHub" },
    { key: "portfolio", label: "Portfolio" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button
            onClick={() => router.push("/dashboard")}
            className="mb-2 px-4 py-2 rounded-lg bg-blue-600 text-white btn-blue"
        >
          ← Back
        </button>

        <h1 className="text-xl font-semibold">Details of {id}</h1>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[#1e293b] border px-3 py-2 rounded"
        />
      </div>

      {/* TABS */}
      <div className="grid grid-cols-4 border-b border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 text-center ${
              activeTab === tab.key
                ? "text-blue-400 border-b-2 border-blue-400 bg-[#1e293b]"
                : "text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="bg-[#1e293b] p-6 rounded-xl">

        {activeTab === "applications" && (
          <JobApplicationsView candidateId={id} date={date} />
        )}

        {activeTab === "linkedin" && (
          <LinkedinView candidateId={id} date={date} />
        )}

        {activeTab === "github" && (
          <GithubActivitiesView candidateId={id} date={date} />
        )}

        {activeTab === "portfolio" && (
          <div>Portfolio UI pending</div>
        )}

      </div>
    </div>
  );
}