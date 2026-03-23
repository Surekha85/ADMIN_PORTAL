"use client";

import { useEffect, useState } from "react";
import { Users, UserCog, LayoutDashboard } from "lucide-react";
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
      <aside className="
        w-64 bg-[var(--bg)] text-[var(--text)] p-4
        border-r border-gray-200
        flex flex-col justify-between
        rounded-r-2xl shadow-sm
      ">
        <div>
          <Menu
            title="Dashboard"
            icon={<LayoutDashboard size={18} />}
            active={router.pathname === "/dashboard"}
            onClick={() => router.push("/dashboard")}
          />

          <Menu
            title="Candidates"
            icon={<Users size={18} />}
            active={router.pathname === "/candidates"}
            onClick={() => router.push("/candidates")}
          />

          <Menu
            title="Assistants"
            icon={<UserCog size={18} />}
            active={router.pathname === "/assistants"}
            onClick={() => router.push("/assistants")}
          />
        </div>

        {/* Bottom */}
        <div className="text-xs text-gray-400 text-center border-t pt-3">
          🚀 More features coming soon
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Overview of platform activity
          </p>
        </div>

        <DashboardOverview candidates={candidates} assistants={assistants} />

      </main>
    </div>
  );
}

//////////////////////////////////////////////////////
// MENU
//////////////////////////////////////////////////////
function Menu({ title, icon, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3
        px-4 py-3 mb-2 rounded-xl cursor-pointer
        transition-all duration-200

        ${active
          ? "bg-[var(--chip-bg)] text-[var(--primary)] font-medium shadow-sm"
          : "text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text)]"
        }
      `}
    >
      {icon}
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
        icon={<Users size={20} />}
        subtitle={
          candidates.length === 0
            ? "No candidates yet"
            : "Active users in platform"
        }
        extra="Active Candidates"
      />

      <Card
        title="Total Assistants"
        value={assistants.length}
        icon={<Users size={20} />}
        subtitle="Mentors / Assistants"
        extra="Active Assistants"
      />

    </div>
  );
}

//////////////////////////////////////////////////////
// CARD
//////////////////////////////////////////////////////
function Card({ title, value, icon, subtitle, extra }) {
  return (
    <div className="
      bg-[var(--card)] border-[var(--border)]
      p-6 rounded-2xl
      min-h-[180px]
      flex flex-col justify-between
       card-hover
    ">

      {/* Top */}
      <div className="flex items-center justify-between">
        <div className="text-indigo-500 bg-indigo-50 p-2 rounded-lg">
          {icon}
        </div>

        {extra && (
          <span className="
            text-xs px-3 py-1 rounded-full
            bg-green-100 text-green-600 font-medium
          ">
            {extra}
          </span>
        )}
      </div>

      {/* Middle */}
      <div className="mt-4">
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        <h2 className="text-4xl font-bold mt-1 text-[var(--text)]">
          {value}
        </h2>
      </div>

      {/* Bottom */}
      {subtitle && (
        <p className="text-xs text-gray-400 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}