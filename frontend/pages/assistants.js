"use client";

import { useState, useEffect } from "react";
import { authAPI } from "../services/authAPI";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AssistantsPage() {
  const router = useRouter();

  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });

  // ✅ PASSWORD VALIDATION STATE
  const [passwordValidation, setPasswordValidation] = useState({
    rules: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false
    }
  });

  //////////////////////////////////////////////////////
  // HANDLE CHANGE (UPDATED)
  //////////////////////////////////////////////////////
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (name === "password") {
      setPasswordValidation({
        rules: {
          minLength: value.length >= 8,
          hasUppercase: /[A-Z]/.test(value),
          hasLowercase: /[a-z]/.test(value),
          hasNumber: /[0-9]/.test(value),
          hasSpecial: /[^A-Za-z0-9]/.test(value)
        }
      });
    }
  };

  const isPasswordValid = Object.values(passwordValidation.rules).every(Boolean);

  //////////////////////////////////////////////////////
  // LOAD DATA
  //////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      try {
        let res = await authAPI.getAssistants();

        if (res?.body) res = JSON.parse(res.body);

        let parsed = [];

        if (typeof res?.assistants === "string") {
          parsed = JSON.parse(res.assistants);
        } else if (Array.isArray(res?.assistants)) {
          parsed = res.assistants;
        }

        setAssistants(parsed);
        setSelectedAssistant(parsed[0] || null);

      } catch (e) {
        console.error(e);
        toast.error("Failed to load assistants");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCreate = async () => {
    const { first_name, last_name, email, password } = form;

    if (!first_name || !last_name || !email || !password) {
      toast.error("Please fill mandatory fields");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    try {
      toast.loading("Creating assistant...", { id: "create" });

      await authAPI.createAssistant(form);

      toast.success("Assistant created", { id: "create" });

      // refresh
      let res = await authAPI.getAssistants();

      if (res?.body) res = JSON.parse(res.body);

      let parsed = [];

      if (typeof res?.assistants === "string") {
        parsed = JSON.parse(res.assistants);
      } else if (Array.isArray(res?.assistants)) {
        parsed = res.assistants;
      }

      setAssistants(parsed);
      setSelectedAssistant(parsed[0] || null);

      setShowModal(false);
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: ""
      });

      // reset validation
      setPasswordValidation({
        rules: {
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecial: false
        }
      });

    } catch (err) {
      console.error("Create Assistant Error:", err);

      // ✅ CLEAN ERROR MESSAGE
      toast.error(err.message || "Error creating assistant", {
        id: "create",
      });
    }
  };

  //////////////////////////////////////////////////////
  // NAVIGATION
  //////////////////////////////////////////////////////
  const goToDetails = (a) => {
    localStorage.setItem("selectedAssistant", JSON.stringify(a));
    router.push(`/assistants_details?id=${a.assistantId}`);
  };

  //////////////////////////////////////////////////////
  // LOADER
  //////////////////////////////////////////////////////
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        Loading assistants...
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

        {/* LEFT: Back + Title */}
        <div className="flex items-center gap-3">
          <Link href='/dashboard' className="relative group">
            <span className="btn-back hover">
              <ArrowLeft size={16} />
              Back to Dashboard
            </span>
          </Link>

          <h1 className="text-2xl font-semibold">
            Assistants
          </h1>

        </div>

        {/* RIGHT: Create Button */}
        <button
          onClick={() => setShowModal(true)}
          className="
      px-4 py-2 rounded-lg
      bg-[var(--primary)]/20 text-[var(--primary)]
      hover:bg-[var(--primary)]/30
    "
        >
          + Create Assistant
        </button>
      </div>

      {/* EMPTY */}
      {assistants.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">

          <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-[var(--border)] text-3xl">
            👨‍💼
          </div>

          <h2 className="text-xl font-semibold">
            No Assistants Found
          </h2>

          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Assistants will appear here once created.
          </p>
        </div>
      ) : (

        <div className="space-y-4">

          {assistants.map((a) => {
            const isActive =
              selectedAssistant?.assistantId === a.assistantId;
            const count = a.assigned_candidates?.length || 0;
            const isDisabled = count === 0;   

            return (
              <div
                key={a.assistantId}
                onClick={() => setSelectedAssistant(a)}
                className={`
                  p-5 rounded-2xl cursor-pointer transition-all duration-200
                  border border-transparent card-hover
                  bg-[var(--card)]

                  ${isActive
                    ? "bg-[var(--primary)]/10 border-[var(--primary)]/30"
                    : "hover:bg-[var(--border)]"
                  }
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
                        ID: {a.assistantId}
                      </p>
                    </div>
                  </div>

                  {/* MIDDLE */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-[var(--text-secondary)]">
                      Assgined Candidates
                    </span>

                    <span className="text-2xl font-bold text-[var(--primary)]">
                      {a.assigned_candidates?.length || 0}
                    </span>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-2">

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--text-secondary)]">
                        Last Login:
                      </span>

                      {a.last_login ? (
                        <span className="text-[var(--text)] font-medium">
                          {new Date(a.last_login).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-secondary)]">
                          Never
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) goToDetails(a);
                      }}
                      disabled={isDisabled}
                      className={`
                        text-sm transition-all duration-200
                        ${isDisabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-[var(--primary)] hover:underline"
                        }
                      `}
                    >
                      {isDisabled ? (
                        <span className="group relative">
                          <span className="group-hover:hidden">View Details</span>
                          <span className="hidden group-hover:inline text-red-400">
                            No candidates assigned
                          </span>
                        </span>
                      ) : (
                        "View Details"
                      )}
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-[var(--card)] p-6 rounded-xl w-[400px] space-y-4 border border-[var(--border)]">

            <h2 className="text-xl font-semibold">
              Create Assistant
            </h2>

            {/* FORM */}
            <div className="space-y-3">

              <Input
                label="First Name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
              />

              <Input
                label="Last Name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
              />

              <Input
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
              />

              {/* ✅ PASSWORD RULES UI */}
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

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-4">

              <button
                onClick={() => setShowModal(false)}
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
                  !isPasswordValid
                }
                className="
                  px-4 py-2 rounded-lg
                  bg-[var(--primary)] text-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Create
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export function Input({ label, name, value, onChange, type = "text" }) {
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
          className="
            w-full p-2 pr-10 rounded-lg
            border border-[var(--border)]
            bg-[var(--bg)]
            outline-none
            focus:border-[var(--primary)]
          "
        />

        {/* 👁 Eye Icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              text-[var(--text-secondary)]
              hover:text-[var(--text)]
            "
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}