import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { authAPI } from "../services/authAPI";

export default function PortfolioDashboard({ candidateId }) {
  const [portfolio, setPortfolio] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [availableHeight, setAvailableHeight] = useState(0);

  useEffect(() => {
    const calculateHeight = () => {
      const navbar = document.getElementById("app-navbar");
      if (navbar) {
        setAvailableHeight(window.innerHeight - navbar.offsetHeight);
      }
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const normalizePortfolio = (res) => {
    if (!res) return null;
    return {
      ...res,
      github_repo_url: res.github?.repo_url,
      github_repo_name: res.github?.repo_name,
      vercel_project_name: res.vercel?.project_name,
      vercel_deployment_url: res.vercel?.deployment_url,
    };
  };

  const fetchPortfolio = async () => {
    try {
      const res = await authAPI.getPortfolio(candidateId);
      const normalized = normalizePortfolio(res);

      setPortfolio(normalized);
      setRequests(normalized?.change_requests || []);
    } catch {
      setPortfolio(null);
    }
  };

  const fetchCandidate = async () => {
    try {
      const res = await authAPI.getCandidateProfile(candidateId);
      setCandidate(res);
    } catch {}
  };

  useEffect(() => {
    if (candidateId) {
      fetchPortfolio();
      fetchCandidate();
    }
  }, [candidateId]);

  const pendingRequests = requests.filter(
    (r) => r.status === "PENDING" || r.status === "IN_PROGRESS"
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* HEADER */}
      <div className="px-8 py-6 flex justify-between items-center border-b border-[var(--border)]">

        <h2 className="text-lg font-semibold"> Portfolio Details</h2>

        {/* RIGHT SIDE BUTTON */}
        {pendingRequests.length > 0 && (
          <div className="relative">

            <button
              onClick={() => setShowRequests(!showRequests)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-400 text-black relative"
            >
              Requests
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {pendingRequests.length}
              </span>
            </button>

            {/* POPUP (ALIGNED TO BUTTON) */}
            {showRequests && (
              <div className="absolute right-0 mt-3 w-[500px] max-h-[300px] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50 flex flex-col">

                <div className="flex justify-between items-center p-3 border-b">
                  <h3 className="font-medium text-sm">
                    Requests ({pendingRequests.length})
                  </h3>
                  <button onClick={() => setShowRequests(false)}>✕</button>
                </div>

                <div className="p-3 space-y-3 overflow-y-auto">
                  {pendingRequests.map((req) => {
                    const getStatusStyles = (status) => {
                      switch (status) {
                        case "PENDING":
                          return "bg-yellow-100 text-yellow-700 border-yellow-300";
                        case "IN_PROGRESS":
                          return "bg-blue-100 text-blue-700 border-blue-300";
                        case "COMPLETED":
                          return "bg-green-100 text-green-700 border-green-300";
                        default:
                          return "bg-gray-100 text-gray-600 border-gray-300";
                      }
                    };

                    return (
                      <div
                        key={req.request_id}
                        className="flex items-start justify-between gap-3 border border-gray-700 p-3 rounded-lg"
                      >
                        {/* LEFT - DESCRIPTION */}
                        <p className="text-sm font-medium text-[var(--text)] max-w-[75%] whitespace-pre-wrap break-words">
                          {req.description}
                        </p>

                        {/* RIGHT - STATUS */}
                        <span
                          className={`text-sm font-semibold px-2 py-1 rounded-full border h-fit ${getStatusStyles(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN */}
      {/* MAIN */}
<div
  className="px-8 py-6 flex justify-center overflow-auto"
  style={{ height: availableHeight }}
>
  {portfolio ? (
    <div className="w-full max-w-5xl">

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">

        {/* ================= USER ================= */}
        <div className="p-6 flex justify-between items-start">

          {/* LEFT */}
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-lg font-semibold">
              {candidate?.first_name?.charAt(0)?.toUpperCase() || "C"}
            </div>

            <div>
              <h2 className="font-semibold text-lg">
                {candidate?.first_name || ""} {candidate?.last_name || ""}
              </h2>

              <p className="text-sm text-[var(--text-secondary)]">
                {candidate?.email || "—"}
              </p>

              <div className="text-xs text-[var(--text-secondary)] mt-1">
                <p>User ID: {candidate?.user_id || "—"}</p>
                <p>Candidate ID: {candidateId}</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <p className="text-sm">
              Last Updated:
            </p>
            <p className="text-sm font-medium">
              {portfolio.updated_at
                ? new Date(portfolio.updated_at).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--border)]" />

        {/* ================= PORTFOLIO ================= */}
        <div className="p-6 space-y-6">

          <h3 className="font-semibold text-sm">Portfolio Details</h3>

          <div className="grid grid-cols-2 gap-6 text-sm">

            {/* Portfolio ID */}
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Portfolio ID</p>
              <p className="font-medium break-all">{portfolio.portfolio_id}</p>
            </div>

            {/* Created By */}
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Created By</p>
              <p className="font-medium break-all">{portfolio.created_by}</p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Status</p>
              <p className="font-medium">{portfolio.status || "—"}</p>
            </div>

            {/* Created At */}
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Created At</p>
              <p className="font-medium">
                {portfolio.created_at
                  ? new Date(portfolio.created_at).toLocaleString()
                  : "—"}
              </p>
            </div>

            {/* GitHub */}
            <div className="col-span-2">
              <p className="text-xs text-[var(--text-secondary)]">GitHub Repository</p>

              <p className="font-medium">
                {portfolio.github_repo_name || "—"}
              </p>

              {portfolio.github_repo_url && (
                <a
                  href={portfolio.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline flex items-center gap-1 mt-1 break-all"
                >
                  {portfolio.github_repo_url}
                  <ExternalLink size={16} />
                </a>
              )}
            </div>

            {/* Vercel */}
            <div className="col-span-2">
              <p className="text-xs text-[var(--text-secondary)]">Deployment</p>

              <p className="font-medium">
                {portfolio.vercel_project_name || "—"}
              </p>

              {portfolio.vercel_deployment_url && (
                <a
                  href={portfolio.vercel_deployment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline flex items-center gap-1 mt-1 break-all"
                >
                  {portfolio.vercel_deployment_url}
                  <ExternalLink size={16} />
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center h-[70vh] text-center">
      <p className="text-lg font-medium mb-2">No Portfolio Found</p>
      <p className="text-sm text-[var(--text-secondary)]">
        Add a portfolio to get started
      </p>
    </div>
  )}
</div>
    </div>
  );
}