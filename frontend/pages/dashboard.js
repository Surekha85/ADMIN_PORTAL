"use client";

import { useEffect, useState } from "react";
import { Users, UserCog, LayoutDashboard, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";
import { authAPI } from "../services/authAPI";

export default function AdminDashboard() {
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [availableHeight, setAvailableHeight] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });

  //////////////////////////////////////////////////////
  // HEIGHT
  //////////////////////////////////////////////////////
  useEffect(() => {
    const calculateHeight = () => {
      const navbar = document.getElementById("app-navbar");

      const navHeight = navbar ? navbar.offsetHeight : 0;
      const screenHeight = window.innerHeight;

      setAvailableHeight(screenHeight - navHeight);
    };

    setTimeout(calculateHeight, 0);

    window.addEventListener("resize", calculateHeight);

    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // ADMIN DATA
  const admin =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("jobsyme_admin_data") || "{}")
      : {};

  // LOAD DATA
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
      // setAssistants(Array.isArray(aRes?.assistants) ? aRes.assistants : []);

    } catch (e) {
      console.error("Error loading data:", e);
      setCandidates([]);
      setAssistants([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordValidation = {
    rules: {
      minLength: form.password.length >= 8,
      hasUppercase: /[A-Z]/.test(form.password),
      hasLowercase: /[a-z]/.test(form.password),
      hasNumber: /[0-9]/.test(form.password),
      hasSpecial: /[^A-Za-z0-9]/.test(form.password)
    }
  };

  const isPasswordValid = Object.values(passwordValidation.rules).every(Boolean);

  //////////////////////////////////////////////////////
  // CREATE ASSISTANT
  //////////////////////////////////////////////////////
  const handleCreate = async () => {
    try {
      setCreating(true);

      await authAPI.createAssistant(form);

      setShowCreateModal(false);

      // reset form
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: ""
      });

      loadData();

    } catch (e) {
      console.error("Create assistant failed", e);
    } finally {
      setCreating(false);
    }
  };

  //////////////////////////////////////////////////////
  // CONDITIONS
  //////////////////////////////////////////////////////
  const noCandidates = candidates.length === 0;
  const noAssistants = assistants.length === 0;
  const showSidebar = !(noCandidates && noAssistants);

  //////////////////////////////////////////////////////
  // EMPTY STATE
  //////////////////////////////////////////////////////
  if (!showSidebar) {
    return (
      <div
        className="flex items-center justify-center flex-col bg-[var(--bg)] text-center"
        style={{ height: availableHeight }}
      >
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6">
          Welcome{" "}
          <span className="text-[var(--primary)]">
            {admin?.first_name || "User"} {admin?.last_name || ""}
          </span>
        </h1>

        <p className="text-lg text-[var(--text-secondary)] max-w-xl">
          No assistants or candidates are available yet.
          <br />
          Admins can create assistants to get started.
        </p>

        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-6 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:opacity-90 transition"
        >
          + Create Assistant
        </button>

        {/* ✅ MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-[var(--card)] p-6 rounded-xl w-[400px] space-y-4 border border-[var(--border)]">

              <h2 className="text-xl font-semibold">
                Create Assistant
              </h2>

              <div className="space-y-3">

                <Input label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
                <Input label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
                <Input label="Email" name="email" value={form.email} onChange={handleChange} />
                <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} />

                {form.password && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      Password Requirements:
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries({
                        minLength: "8+ characters",
                        hasUppercase: "Uppercase letter",
                        hasLowercase: "Lowercase letter",
                        hasNumber: "Number",
                        hasSpecial: "Special character"
                      }).map(([key, label]) => (
                        <div
                          key={key}
                          className={`flex items-center space-x-1 ${
                            passwordValidation.rules[key]
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          <span>
                            {passwordValidation.rules[key] ? "✓" : "✗"}
                          </span>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="flex justify-end gap-2 pt-4">

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[var(--border)] rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreate}
                  disabled={
                    !form.first_name ||
                    !form.last_name ||
                    !form.email ||
                    !isPasswordValid ||
                    creating
                  }
                  className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create"}
                </button>

              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex bg-[var(--bg)] text-[var(--text)]" style={{ height: availableHeight }}>

      {/* SIDEBAR */}
      <aside className="w-72 m-4 rounded-2xl p-5 bg-[var(--card)] border border-[var(--border)] overflow-hidden">

        <Menu
          title="Dashboard"
          icon={<LayoutDashboard size={18} />}
          active={router.pathname === "/dashboard"}
          onClick={() => router.push("/dashboard")}
        />

        <Menu
            title="Assistants"
            icon={<UserCog size={18} />}
            onClick={() => router.push("/assistants")}
          />

        {!noCandidates && (
          <Menu
            title="Candidates"
            icon={<Users size={18} />}
            onClick={() => router.push("/candidates")}
          />
        )}

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


function Menu({ title, icon, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-xl cursor-pointer ${
        active ? "bg-[var(--chip-bg)] text-[var(--primary)]" : ""
      }`}
    >
      {icon}
      {title}
    </div>
  );
}

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


function Input({ label, name, value, onChange, type = "text" }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="block text-sm mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 pr-10 rounded-lg border border-[var(--border)] bg-[var(--bg)]"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}