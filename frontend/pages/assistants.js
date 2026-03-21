import { useEffect, useState } from "react";
import { authAPI } from "../services/authAPI";
import toast from "react-hot-toast";

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });

  const [submitting, setSubmitting] = useState(false);

  // 🔥 FETCH ASSISTANTS
  const fetchAssistants = async () => {
    try {
      const res = await authAPI.getAssistants();
      setAssistants(res || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load assistants");
      toast.error(err.message || "Failed to load assistants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  // 🔥 HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 CREATE ASSISTANT
  const handleCreate = async () => {
    const { first_name, last_name, email, password } = form;

    // VALIDATION
    if (!first_name || !last_name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setSubmitting(true);

      toast.loading("Creating assistant...", { id: "createAssistant" });

      await authAPI.createAssistant(form);

      toast.success("Assistant created successfully", {
        id: "createAssistant"
      });

      await fetchAssistants();

      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: ""
      });

      setShowModal(false);
    } catch (err) {
      console.error("CREATE ERROR:", err);

      toast.error(err.message || "Failed to create assistant", {
        id: "createAssistant"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading assistants...</div>;

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">All Assistants</h1>

        <button
          onClick={() => {
            setShowModal(true);
            toast("Fill details to create assistant", { icon: "ℹ️" });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Assistant
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#1e293b] text-left">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Assistant ID</th>
              <th className="p-3 border">Assigned Candidates</th>
              <th className="p-3 border">Last Login</th>
              <th className="p-3 border">Created At</th>
            </tr>
          </thead>

          <tbody>
            {assistants.map((a) => (
              <tr key={a.assistantId} className="hover:bg-gray-50 dark:hover:bg-[#0f172a]">
                <td className="p-3 border font-medium">
                  {a.first_name} {a.last_name}
                </td>
                <td className="p-3 border">{a.email}</td>
                <td className="p-3 border text-xs">{a.assistantId}</td>
                <td className="p-3 border">
                  {a.assigned_candidates?.length || 0}
                </td>
                <td className="p-3 border">
                  {a.last_login
                    ? new Date(a.last_login).toLocaleString()
                    : "—"}
                </td>
                <td className="p-3 border">
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assistants.length === 0 && (
        <p className="mt-4 text-gray-500">No assistants found.</p>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-lg w-[400px] space-y-4">

            <h2 className="text-xl font-semibold">Create Assistant</h2>

            <div className="space-y-3">
              <Input label="First Name *" name="first_name" value={form.first_name} onChange={handleChange} />
              <Input label="Last Name *" name="last_name" value={form.last_name} onChange={handleChange} />
              <Input label="Email *" name="email" value={form.email} onChange={handleChange} />
              <Input label="Password *" type="password" name="password" value={form.password} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* INPUT */
function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded bg-white dark:bg-[#0f172a]"
      />
    </div>
  );
}