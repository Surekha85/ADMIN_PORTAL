"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authAPI } from "../services/authAPI";

export default function CandidateDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState(null);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem("selectedCandidate");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {}
    }
  }, [id]);

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] text-white p-6">

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
// FIELD (CLEAN)
//////////////////////////////////////////////////////
function Field({ label, value }) {
  return (
    <div className="bg-[var(--bg)] text-[var(--text)] border border-gray-700 rounded-lg px-4 py-3">

      <p className="text-xs text-gray-400 mb-1">
        {label}
      </p>

      <p className="text-sm font-medium break-words">
        {value || "-"}
      </p>

    </div>
  );
}

//////////////////////////////////////////////////////
// OBJECT RENDER
//////////////////////////////////////////////////////
function RenderObject({ obj }) {
  if (!obj) return null;

  return Object.entries(obj).map(([k, v]) => {
    if (Array.isArray(v)) {
      return (
        <div key={k} className="col-span-2 bg-[var(--bg)] text-[var(--text)] border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">{k}</p>

          <div className="flex flex-wrap gap-2">
            {v.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Field
        key={k}
        label={k}
        value={typeof v === "boolean" ? String(v) : v}
      />
    );
  });
}