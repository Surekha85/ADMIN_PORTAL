import { Users, UserCog, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authAPI } from "../services/authAPI";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("candidates");
  const [height, setHeight] = useState("100vh");
  const [assistantCount, setAssistantCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const nav = document.querySelector("nav");
      const h = nav ? nav.offsetHeight : 0;
      setHeight(`${window.innerHeight - h}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        let res = await authAPI.getAssistants();

        if (res?.body && typeof res.body === "string") {
          res = JSON.parse(res.body);
        }

        const list = Array.isArray(res)
          ? res
          : res?.assistants || res?.data || [];

        setAssistantCount(list.length);
      } catch {
        setAssistantCount(0);
      }
    };

    fetchAssistants();
  }, []);

  return (
    <div className="flex bg-[#0f172a] text-white">

      {/* SIDEBAR */}
      <aside style={{ width: "25%", height }} className="min-w-[250px] p-4">
        <div className="bg-[#1e293b] h-full rounded-xl p-4 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Admin</h2>

          <div className="space-y-2">
            <MenuItem title="All Candidates" icon={<Users size={18} />} active={activeTab==="candidates"} onClick={()=>setActiveTab("candidates")} />
            <MenuItem title="All Assistants" icon={<UserCog size={18} />} count={assistantCount} active={activeTab==="assistants"} onClick={()=>setActiveTab("assistants")} />
            <MenuItem title="More Tools" icon={<Rocket size={18} />} subtitle="Coming Soon" disabled />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ width: "75%", height }} className="p-6 overflow-hidden">
        {activeTab === "candidates" && <Candidates />}
        {activeTab === "assistants" && <Assistants />}
      </main>
    </div>
  );
}

/* MENU */
function MenuItem({ icon, title, subtitle, count, active, disabled, onClick }) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer
        ${active ? "bg-blue-900/30 text-blue-400" : "hover:bg-[#0f172a]"}
        ${disabled ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className="text-sm font-medium">{title}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>

      {count !== undefined && (
        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

//////////////////////////////////////////////////////////
// ✅ CANDIDATES (FIXED PROPERLY)
//////////////////////////////////////////////////////////
function Candidates() {
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res = await authAPI.getCandidates();

        console.log("RAW:", res);

        // Handle API Gateway body
        if (res?.body && typeof res.body === "string") {
          res = JSON.parse(res.body);
        }

        let list = [];

        // 🔥 MAIN FIX
        if (typeof res?.candidates === "string") {
          list = JSON.parse(res.candidates);
        } 
        else if (Array.isArray(res?.candidates)) {
          list = res.candidates;
        } 
        else if (Array.isArray(res)) {
          list = res;
        }

        setData(list);

      } catch (err) {
        console.error("ERROR:", err);
        setData([]);
      }
    };

    fetchData();
  }, []);

  if (!data.length) return <p>No candidates found</p>;

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-xl font-semibold mb-4">Candidates</h1>

      <div className="table-wrapper flex-1 bg-[#1e293b] rounded-xl border border-gray-700">
        <div className="table-scroll">
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Job Type</th>
                <th>Assistant</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {data.map((c, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>

                  <td
                    style={{ color: "#38bdf8", cursor: "pointer", textDecoration: "underline" }}
                    onDoubleClick={() =>
                      router.push(`/candidate_details?id=${c.jaa_candidate_id}`)
                    }
                  >
                    {c.first_name} {c.last_name}
                  </td>

                  <td>{c.email}</td>
                  <td>{c.address?.city}, {c.address?.state}</td>
                  <td>{c.careerDetails?.yearsExperience} yrs</td>
                  <td>{c.careerDetails?.preferredJobType}</td>
                  <td>{c.assistantAssignedTo || "N/A"}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////
// ✅ ASSISTANTS (SAFE FIX)
//////////////////////////////////////////////////////////
function Assistants() {
  const [assistants, setAssistants] = useState([]);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        let res = await authAPI.getAssistants();

        if (res?.body && typeof res.body === "string") {
          res = JSON.parse(res.body);
        }

        const list = Array.isArray(res)
          ? res
          : res?.assistants || res?.data || [];

        setAssistants(list);
      } catch {
        setAssistants([]);
      }
    };

    fetchAssistants();
  }, []);

  if (!assistants.length) return <p>No assistants</p>;

  const columns = Object.keys(assistants[0]);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-xl font-semibold mb-4">Assistants</h1>

      <div className="table-wrapper flex-1 bg-[#1e293b] rounded-xl border border-gray-700">
        <div className="table-scroll">
          <table className="custom-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {assistants.map((a, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col}>
                      {typeof a[col] === "object"
                        ? JSON.stringify(a[col])
                        : String(a[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}