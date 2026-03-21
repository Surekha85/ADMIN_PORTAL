import {
  LayoutDashboard,
  Users,
  UserCog,
  Rocket
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authAPI } from "../services/authAPI";

export default function AdminDashboard() {
  const router = useRouter();

  const [sidebarHeight, setSidebarHeight] = useState("100vh");
  const [assistantCount, setAssistantCount] = useState(0);

  // 🔥 Dynamic height (viewport - navbar)
  useEffect(() => {
    const updateHeight = () => {
      const header = document.querySelector("nav");
      const headerHeight = header ? header.offsetHeight : 0;
      setSidebarHeight(`${window.innerHeight - headerHeight}px`);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // 🔥 Fetch assistants count
  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const res = await authAPI.getAssistants();
        setAssistantCount(res.length || 0);
      } catch (e) {
        console.error(e);
      }
    };

    loadAssistants();
  }, []);

  return (
    <div className="flex bg-[#f8fafc] dark:bg-[#0f172a] text-black dark:text-white">

      {/* SIDEBAR */}
      <aside
        style={{ height: sidebarHeight }}
        className="w-80 px-4 py-5 flex flex-col overflow-y-auto custom-scroll border-r border-gray-200 dark:border-gray-800"
      >
        {/* HEADER */}
        <div className="flex items-center gap-2 mb-6 px-2">
          <LayoutDashboard size={20} />
          <h2 className="text-lg font-semibold">Admin</h2>
        </div>

        {/* SERVICES */}
        <div>
          <p className="text-sm text-gray-500 mb-3 px-2">Services</p>

          <div className="space-y-2">

            <SidebarItem
              icon={<Users size={18} />}
              label="All Candidates"
              active={router.pathname === "/candidates"}
              onClick={() => router.push("/candidates")}
            />

            <SidebarItem
              icon={<UserCog size={18} />}
              label="All Assistants"
              count={assistantCount}
              active={router.pathname === "/assistants"}
              onClick={() => router.push("/assistants")}
            />

            <SidebarItem
              icon={<Rocket size={18} />}
              label="More Tools"
              sub="Coming Soon"
              disabled
            />

          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-[#1e293b]">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              More features coming soon
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Stay tuned for our next big update.
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Select a menu option from the left.
        </p>
      </main>
    </div>
  );
}

/* 🔥 SIDEBAR ITEM */
function SidebarItem({ icon, label, sub, count, active, disabled, onClick }) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200
        ${active
          ? "bg-gray-200 dark:bg-[#1e293b]"
          : "hover:bg-gray-100 dark:hover:bg-[#1e293b]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-600 dark:text-gray-300 group-hover:scale-110 transition">
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium transition group-hover:text-[15px]">
            {label}
          </p>
          {sub && (
            <p className="text-xs text-gray-500">{sub}</p>
          )}
        </div>
      </div>

      {/* COUNT BADGE */}
      {count !== undefined && (
        <div className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
          {count}
        </div>
      )}
    </div>
  );
}