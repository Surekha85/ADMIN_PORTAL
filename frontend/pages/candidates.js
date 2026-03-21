import { useEffect, useState } from "react";
import { authAPI } from "../services/authAPI";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 FETCH FROM YOUR BACKEND
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await authAPI.getCandidates();

        console.log("✅ Candidates API Response:", res);

        // 👉 Adjust if API wraps response differently
        setCandidates(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // 🔄 LOADING
  if (loading) {
    return <div className="p-6">Loading candidates...</div>;
  }

  // ❌ ERROR
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">All Candidates</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
        <table className="min-w-full text-sm">
          
          {/* HEADER */}
          <thead className="bg-gray-100 dark:bg-[#1e293b] text-left">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Location</th>
              <th className="p-3 border">Experience</th>
              <th className="p-3 border">Skills</th>
              <th className="p-3 border">Job Type</th>
              <th className="p-3 border">Visa</th>
              <th className="p-3 border">Assistant</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {candidates.map((c) => (
              <tr
                key={c.jaa_candidate_id}
                className="hover:bg-gray-50 dark:hover:bg-[#0f172a]"
              >
                <td className="p-3 border font-medium">
                  {c.first_name} {c.last_name}
                </td>

                <td className="p-3 border">{c.email}</td>

                <td className="p-3 border">{c.phone}</td>

                <td className="p-3 border">
                  {c.address?.city}, {c.address?.state}
                </td>

                <td className="p-3 border">
                  {c.careerDetails?.yearsExperience} yrs
                </td>

                <td className="p-3 border">
                  {c.careerDetails?.skills?.join(", ")}
                </td>

                <td className="p-3 border">
                  {c.careerDetails?.preferredJobType}
                </td>

                <td className="p-3 border">
                  {c.careerDetails?.visaRequired ? "Yes" : "No"}
                </td>

                <td className="p-3 border">
                  {c.assistantAssignedTo || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMPTY STATE */}
      {candidates.length === 0 && (
        <p className="mt-4 text-gray-500">No candidates found.</p>
      )}
    </div>
  );
}