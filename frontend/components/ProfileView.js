"use client";

import { useEffect, useState } from "react";
import { authAPI } from "../services/authAPI";
import { Copy, Check } from "lucide-react";

export default function CandidateDetails({ candidateId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

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
  const copy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(
      typeof text === "object" ? JSON.stringify(text) : text.toString()
    );
    setCopied(key);
    setTimeout(() => setCopied(""), 1200);
  };
  
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">
          Profile Details of {data.first_name} {data.last_name}
          </h1>

        <div />
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* BASIC */}
        <Section title="Basic Information">
          <Field label="first_name" value={data.first_name} copy={copy} copied={copied} id="fn" />
          <Field label="last_name" value={data.last_name} copy={copy} copied={copied} id="ln" />
          <Field label="email" value={data.email} copy={copy} copied={copied} id="email" />
          <Field label="phone" value={data.phone} copy={copy} copied={copied} id="phone" />
          <Field label="linkedin" value={data.linkedin} copy={copy} copied={copied} id="linkedin" />
          <Field label="github" value={data.github} copy={copy} copied={copied} id="github" />
          <Field label="resumeUrl" value={data.resumeUrl} copy={copy} copied={copied} id="resume" />
          <Field label="createdAt" value={data.createdAt} copy={copy} copied={copied} id="created" />
          <Field label="updatedAt" value={data.updatedAt} copy={copy} copied={copied} id="updated" />
        </Section>

        {/* ADDRESS */}
        <Section title="Address">
          {renderObject(data.address, copy, copied)}
        </Section>

        {/* CAREER */}
        <Section title="Career Details">
          {renderObject(data.careerDetails, copy, copied)}
        </Section>

        {/* JOB PREF */}
        <Section title="Job Preferences">
          {renderObject(data.jobPreferences, copy, copied)}
        </Section>

        {/* DEMOGRAPHIC */}
        <Section title="Demographic">
          {renderObject(data.demographic, copy, copied)}
        </Section>

        {/* GMAIL */}
        <Section title="Dedicated Gmail">
          {renderObject(data.dedicatedGmailAccount, copy, copied)}
        </Section>

      </div>
    </div>
  );
}

/* 🔥 LABEL FORMATTER */
function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase());
}

/* 🔥 RENDER OBJECT */
function renderObject(obj, copy, copied) {
  if (!obj) return null;

  return Object.entries(obj).map(([k, v]) => {
    if (Array.isArray(v)) {
      return (
        <ChipsBlock
          key={k}
          title={formatLabel(k)}
          data={v}
          copy={copy}
          copied={copied}
          id={k}
        />
      );
    }

    return (
      <Field
        key={k}
        label={k}
        value={typeof v === "boolean" ? String(v) : v}
        copy={copy}
        copied={copied}
        id={k}
      />
    );
  });
}

/* SECTION */
function Section({ title, children }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
      <h2 className="text-md font-semibold mb-4 text-blue-500">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

/* FIELD */
function Field({ label, value, copy, copied, id }) {
  const isResume = label === "resumeUrl" && value;

  // Extract file name from URL
  const getFileName = (url) => {
    try {
      return url.split("/").pop().split("?")[0];
    } catch {
      return "resume";
    }
  };

  const handleDownload = () => {
    if (!value) return;
    const link = document.createElement("a");
    link.href = value;
    link.download = getFileName(value);
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="flex justify-between items-center border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg-secondary)]">
      
      <div className="overflow-hidden">
        <p className="text-xs text-[var(--text-secondary)]">
          {formatLabel(label)}
        </p>

        {/* ✅ Show filename instead of full URL */}
        <p className="text-sm font-medium truncate">
          {isResume ? getFileName(value) : (value || "-")}
        </p>
      </div>

      <div className="flex items-center gap-2">

        {/* ✅ DOWNLOAD ICON ONLY FOR RESUME */}
        {isResume ? (
          <button
            onClick={handleDownload}
            className="opacity-70 hover:opacity-100"
            title="Download Resume"
          >
            ⬇️
          </button>
        ) : (
          <button
            onClick={() => copy(value, id)}
            className="opacity-70 hover:opacity-100"
          >
            {copied === id ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}

      </div>
    </div>
  );
}

/* CHIPS */
function ChipsBlock({ title, data, copy, copied, id }) {
  return (
    <div className="col-span-2 border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-secondary)]">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-[var(--text-secondary)]">{title}</p>
        <button onClick={() => copy(data.join(", "), id)}>
          {copied === id ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.map((item, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-[var(--bg)] text-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}