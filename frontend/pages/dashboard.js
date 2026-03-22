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

        if (res?.body && typeof res.body === "string") {
          res = JSON.parse(res.body);
        }

        let list = [];

        if (typeof res?.candidates === "string") {
          list = JSON.parse(res.candidates);
        } else if (Array.isArray(res?.candidates)) {
          list = res.candidates;
        } else if (Array.isArray(res)) {
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

  return (
    <div className="h-full flex flex-col p-4">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-6">Candidates</h1>

      {/* EMPTY */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p>No candidates found</p>
        </div>
      ) : (

        <div className="space-y-5  overflow-y-auto">
          <h3>Total Candidates: {data.length}</h3>

          {data.map((c, i) => (
            <div
              key={i}
              className="group relative rounded-3xl p-[1px] bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-transparent hover:from-blue-500/50 transition-all duration-300"
            >
              <div
                className="card-hover bg-[#020617]/90 backdrop-blur-xl rounded-3xl p-4 flex justify-between items-center cursor-pointer"
                onDoubleClick={() =>
                  router.push(`/candidate_details?id=${c.jaa_candidate_id}`)
                }
              >

                {/* LEFT */}
                <div className="flex items-center gap-4">

                  {/* AVATAR */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow">
                    {c.first_name?.[0]}
                  </div>

                  {/* INFO */}
                  <div>
                    <h2 className="text-lg font-semibold group-hover:text-blue-400 transition">
                      {c.first_name} {c.last_name}
                    </h2>

                    <p className="text-sm text-gray-400">
                      {c.email}
                    </p>

                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>{c.address?.city}, {c.address?.state}</span>
                      <span>•</span>
                      <span>{c.address?.country}</span>
                    </div>

                    {/* SKILLS */}
                    <div className="mt-2">
                      {Array.isArray(c.skills) && c.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {c.skills.slice(0, 4).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-[10px] rounded-full bg-blue-500/10 text-blue-400"
                            >
                              {skill}
                            </span>
                          ))}
                          {c.skills.length > 4 && (
                            <span className="text-[10px] text-gray-500">
                              +{c.skills.length - 4}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No skills</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-8">

                  {/* METRICS */}
                  <div className="hidden md:flex gap-8 text-xs text-gray-400">

                    <div>
                      <p className="text-gray-500">Experience</p>
                      <p className="font-medium text-white">
                        {c.careerDetails?.yearsExperience} yrs
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Assign Assistant</p>
                      <p className="font-medium text-white">
                        {c.assistantAssignedTo || "N/A"}
                      </p>
                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/candidate_details?id=${c.jaa_candidate_id}`);
                      }}
                      className="px-3 py-1 text-xs rounded-lg btn-blue text-white"
                    >
                      View
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}
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