"use client";

import { useEffect, useState } from "react";
import { authAPI } from "../services/authAPI";
import { Copy, Check } from "lucide-react";

export default function CandidateDetails({ candidateId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    const fetchCandidate = async () => {
      try {
        setLoading(true);

        //////////////////////////////////////////////////////
        //  1. CHECK IF DATA ALREADY EXISTS (FROM OTHER PAGE)
        //////////////////////////////////////////////////////
        const stored = localStorage.getItem("selectedCandidate");
        if (stored) {
          const parsedStored = JSON.parse(stored);

          // ✅ VERY IMPORTANT CHECK
          if (parsedStored?.id == candidateId) {
            setData(parsedStored);
            setLoading(false);
            return;
          }
        }

        //////////////////////////////////////////////////////
        // 2. FALLBACK TO API
        //////////////////////////////////////////////////////
        const res = await authAPI.getCandidateProfile(candidateId);

        const parsed =
          res?.body && typeof res.body === "string"
            ? JSON.parse(res.body)
            : res;

        setData(parsed);
      } catch (err) {
        console.error("Error fetching candidate:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId]);

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading candidate details...
      </div>
    );
  }

  // ✅ Empty state
  if (!data) {
    return (
      <div className="p-6 text-red-400">
        Candidate not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">
          {data.first_name} {data.last_name}
        </h1>

        <div />
      </div>

      {/* GRID */}
      <div className="space-y-6">

        <Section title="Basic Information">
          <Field label="First Name" value={data.first_name} />
          <Field label="Last Name" value={data.last_name} />
          <Field label="Email" value={data.email} />
          <Field label="Phone" value={data.phone} />
          <Field label="LinkedIn" value={data.linkedin} />
          <Field label="GitHub" value={data.github} />
          <Field label="Assistant" value={data.assistantAssignedTo} />
        </Section>

        <Section title="Address">
          <RenderObject obj={data.address} />
        </Section>

        <Section title="Career Details">
          <RenderObject obj={data.careerDetails} />
        </Section>

        <Section title="Job Preferences">
          <RenderObject obj={data.jobPreferences} />
        </Section>

        <Section title="Demographics">
          <RenderObject obj={data.demographic} />
        </Section>

        <Section title="Dedicated Gmail">
          <RenderObject obj={data.dedicatedGmailAccount} />
        </Section>

      </div>
    </div>
  );
}

//////////////////////////////////////////////////////
// SECTION
//////////////////////////////////////////////////////
function Section({ title, children }) {
  return (
    <div className="bg-[var(--bg)] text-[var(--text)] rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-5 text-blue-400">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////
// FIELD (WITH COPY)
//////////////////////////////////////////////////////
function Field({ label, value }) {
  const [copied, setCopied] = useState(false);

  const displayValue =
    value === null || value === undefined || value === ""
      ? "-"
      : typeof value === "boolean"
      ? String(value)
      : value;

  const handleCopy = async () => {
    if (!displayValue || displayValue === "-") return;

    try {
      await navigator.clipboard.writeText(String(displayValue));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="relative bg-[var(--bg)] text-[var(--text)] border border-gray-700 rounded-lg px-4 py-3 group">

      {/* LABEL */}
      <p className="text-xs text-gray-400 mb-1">
        {label}
      </p>

      {/* VALUE */}
      <p className="text-sm font-medium break-words pr-8">
        {displayValue}
      </p>

      {/* COPY BUTTON */}
      <button
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy"}
        className="absolute top-3 right-3 opacity-70 hover:opacity-100 transition"
      >
        {copied ? (
          <Check size={16} className="text-green-400" />
        ) : (
          <Copy size={16} className="text-gray-400 hover:text-white" />
        )}
      </button>
    </div>
  );
}

//////////////////////////////////////////////////////
// OBJECT RENDER
//////////////////////////////////////////////////////
function RenderObject({ obj }) {
  if (!obj) return null;

  return Object.entries(obj).map(([k, v]) => {
    // ARRAY CASE
    if (Array.isArray(v)) {
      return (
        <ArrayField key={k} label={k} value={v} />
      );
    }

    return (
      <Field
        key={k}
        label={k}
        value={v}
      />
    );
  });
}

//////////////////////////////////////////////////////
// ARRAY FIELD (WITH COPY)
//////////////////////////////////////////////////////
function ArrayField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="col-span-2 relative bg-[var(--bg)] text-[var(--text)] border border-gray-700 rounded-lg p-4 group">

      <p className="text-xs text-gray-400 mb-2">
        {label}
      </p>

      <div className="flex flex-wrap gap-2 pr-8">
        {value.map((item, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs"
          >
            {item}
          </span>
        ))}
      </div>

      {/* COPY BUTTON */}
      <button
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy"}
        className="absolute top-3 right-3 opacity-70 hover:opacity-100 transition"
      >
        {copied ? (
          <Check size={16} className="text-green-400" />
        ) : (
          <Copy size={16} className="text-gray-400 hover:text-white" />
        )}
      </button>
    </div>
  );
}