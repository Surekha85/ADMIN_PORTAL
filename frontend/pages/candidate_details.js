import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authAPI } from "../services/authAPI";

export default function CandidateDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState("applications");
  const [date, setDate] = useState("");

  // ✅ default today date
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  const tabs = ["applications", "linkedin", "github", "portfolio"];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Candidate Details</h1>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[#1e293b] border border-gray-600 px-3 py-2 rounded"
        />
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-6 border-b border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? "bg-blue-600"
                : "bg-[#1e293b] hover:bg-[#334155]"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="bg-[#1e293b] p-6 rounded-xl">

        {activeTab === "applications" && (
          <Applications id={id} date={date} />
        )}

        {activeTab === "linkedin" && (
          <LinkedIn id={id} date={date} />
        )}

        {activeTab === "github" && (
          <GitHub id={id} date={date} />
        )}

        {activeTab === "portfolio" && (
          <Portfolio id={id} />
        )}

      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////
// ✅ APPLICATIONS (SAME LOGIC AS YOUR FILE)
//////////////////////////////////////////////////////////
function Applications({ id, date }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || !date) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getJobApplications(id, date);

        const parsed =
          typeof res.body === "string" ? JSON.parse(res.body) : res;

        setData(parsed);
      } catch (err) {
        console.error("ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, date]);

  if (loading) return <p>Loading applications...</p>;
  if (!data?.applications?.length) return <p>No applications found</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">

        <thead>
          <tr className="border-b border-gray-700 text-left">
            <th className="py-2">Company</th>
            <th>Role</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.applications.map((a, i) => (
            <tr key={i} className="border-b border-gray-800">
              <td className="py-2">{a.company_name}</td>
              <td>{a.job_title}</td>
              <td>{a.application_date}</td>
              <td className="text-green-400">{a.approval_status}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

//////////////////////////////////////////////////////////
// ✅ LINKEDIN
//////////////////////////////////////////////////////////
function LinkedIn({ id, date }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id || !date) return;

    authAPI.getLinkedinActivities(id, date).then((res) => {
      const parsed =
        typeof res.body === "string" ? JSON.parse(res.body) : res;
      setData(parsed);
    });
  }, [id, date]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      {data.activities?.map((a, i) => (
        <div key={i} className="border-b py-2">
          <p>{a.title}</p>
          <p className="text-sm text-gray-400">{a.status}</p>
        </div>
      ))}
    </div>
  );
}

//////////////////////////////////////////////////////////
// ✅ GITHUB
//////////////////////////////////////////////////////////
function GitHub({ id, date }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id || !date) return;

    authAPI.getGithubActivities(id, date).then((res) => {
      const parsed =
        typeof res.body === "string" ? JSON.parse(res.body) : res;
      setData(parsed);
    });
  }, [id, date]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      {data.projects?.map((p, i) => (
        <div key={i} className="mb-4">
          <p className="font-semibold">{p.project_name}</p>
          <p className="text-sm text-gray-400">
            {p.commits?.length || 0} commits
          </p>
        </div>
      ))}
    </div>
  );
}

//////////////////////////////////////////////////////////
// ✅ PORTFOLIO
//////////////////////////////////////////////////////////
function Portfolio({ id }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) return;

    authAPI.getPortfolio(id).then((res) => {
      const parsed =
        typeof res.body === "string" ? JSON.parse(res.body) : res;
      setData(parsed);
    });
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <p>{data.github?.repo_name}</p>

      {data.github?.repo_url && (
        <a href={data.github.repo_url} className="text-blue-400">
          View Repo
        </a>
      )}
    </div>
  );
}