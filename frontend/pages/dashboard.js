"use client";

import { useEffect, useState } from "react";
import { Users, UserCog } from "lucide-react";
import { useRouter } from "next/router";
import { authAPI } from "../services/authAPI";

export default function AdminDashboard() {
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [assistants, setAssistants] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let cRes = await authAPI.getCandidates();
      let aRes = await authAPI.getAssistants();

      if (cRes?.body) cRes = JSON.parse(cRes.body);
      if (aRes?.body) aRes = JSON.parse(aRes.body);

      let parsedCandidates = [];

      if (typeof cRes?.candidates === "string") {
        parsedCandidates = JSON.parse(cRes.candidates);
      } else if (Array.isArray(cRes?.candidates)) {
        parsedCandidates = cRes.candidates;
      }

      setCandidates(parsedCandidates);
      setAssistants(Array.isArray(aRes?.assistants) ? aRes.assistants : []);

    } catch (e) {
      console.error("Error loading data:", e);
      setCandidates([]);
      setAssistants([]);
    }
  };

  return (
    <div className="flex bg-[var(--bg)] text-[var(--text)] min-h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[var(--card)] p-6 border-r border-[var(--border)]">
        <h2 className="text-xl font-semibold mb-8">Admin</h2>

        <Menu title="Dashboard" onClick={() => router.push("/dashboard")} />
        <Menu title="Candidates" onClick={() => router.push("/candidates")} />
        <Menu title="Assistants" onClick={() => router.push("/assistants")} />
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">
        <DashboardOverview candidates={candidates} assistants={assistants} />
      </main>
    </div>
  );
}

//////////////////////////////////////////////////////
// MENU
//////////////////////////////////////////////////////
function Menu({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        px-4 py-3 rounded-xl cursor-pointer
        text-[var(--text-secondary)]
        hover:bg-[var(--border)] hover:text-[var(--text)]
        transition-all duration-200
      "
    >
      {title}
    </div>
  );
}

//////////////////////////////////////////////////////
// DASHBOARD
//////////////////////////////////////////////////////
function DashboardOverview({ candidates, assistants }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

      <Card
        title="Total Candidates"
        value={candidates.length}
        icon={<Users />}
        subtitle={
          candidates.length === 0
            ? "No candidates yet"
            : "Active users in platform"
        }
        extra="Active"
      />

      <Card
        title="Total Assistants"
        value={assistants.length}
        icon={<UserCog />}
        subtitle="Mentors / Assistants"
        extra="Working"
      />

    </div>
  );
}

//////////////////////////////////////////////////////
// CARD (FULLY USING GLOBAL TOKENS)
//////////////////////////////////////////////////////
function Card({ title, value, icon, subtitle, extra }) {
  return (
    <div className="
      bg-[var(--card)]
      border border-[var(--border)]
      p-6 rounded-2xl
      min-h-[170px]
      flex flex-col justify-between
      transition-all duration-300
      hover:shadow-lg hover:-translate-y-1
    ">

      {/* Top */}
      <div className="flex items-center justify-between">
        <div className="text-[var(--primary)] text-3xl">{icon}</div>

        {extra && (
          <span className="
            text-xs 
            px-3 py-1 rounded-full
            bg-[var(--primary)]/20 
            text-[var(--primary)]
          ">
            {extra}
          </span>
        )}
      </div>

      {/* Middle */}
      <div className="mt-4">
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        <h2 className="text-4xl font-bold mt-1">{value}</h2>
      </div>

      {/* Bottom */}
      {subtitle && (
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}