// services/authAPI.js

const getApiBaseUrl = () => {
  if (typeof window === "undefined") return "";
  return "https://i8sfzfef0h.execute-api.us-east-1.amazonaws.com/alpha";
};

export const config = {
  JWT_STORAGE_KEY: "jobsyme_admin_auth_token",
  USER_STORAGE_KEY: "jobsyme_admin_data"
};

class AuthAPIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/* 🔥 CORE REQUEST HANDLER */
const makeAPIRequest = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(config.JWT_STORAGE_KEY)
      : null;

  console.log("🌐 API:", url);
  console.log("🔐 TOKEN:", token);

  try {
    const res = await fetch(url, {
      method: options.method || "GET",
      body: options.method === "GET" ? undefined : options.body, // ✅ FIX
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response");
    }

    // API Gateway nested body fix
    if (data?.body && typeof data.body === "string") {
      try {
        data = JSON.parse(data.body);
      } catch {}
    }

    if (!res.ok) {
      if (res.status === 401) {
        console.warn("⚠️ Unauthorized - logging out");

        if (typeof window !== "undefined") {
          localStorage.removeItem(config.JWT_STORAGE_KEY);
          localStorage.removeItem(config.USER_STORAGE_KEY);
          window.location.href = "/login";
        }
      }

      throw new AuthAPIError(
        data?.message || `API Error (${res.status})`,
        res.status
      );
    }

    return data;

  } catch (err) {
    console.error("❌ NETWORK ERROR:", err);

    // 🔥 Better error message
    if (err.message === "Failed to fetch") {
      throw new Error(
        "CORS / API Gateway issue: OPTIONS request failing (check backend)"
      );
    }

    throw new Error("Backend not reachable");
  }
};

/* 🔥 AUTH + ADMIN APIs */
export const authAPI = {

  adminLogin: async (email, password) => {
    const res = await makeAPIRequest("/admin/login-logout", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    const token = res?.token || res?.data?.token;

    if (!token) {
      throw new Error("Token not found in login response");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(config.JWT_STORAGE_KEY, token);
      localStorage.setItem(
        config.USER_STORAGE_KEY,
        JSON.stringify(res?.admin || {})
      );
    }

    return res;
  },

  /* 👥 ASSISTANTS */
  getAssistants: async () => {
    return makeAPIRequest("/admin/assistants");
  },

  /* 👤 CANDIDATES */
  getCandidates: async () => {
    return makeAPIRequest("/admin/candidates");
  },

  /* 📊 CANDIDATE DETAILS */

  getJobApplications: async (candidateId, date) => {
    return makeAPIRequest(
      `/admin/candidates/${candidateId}/job-applications?date=${date}`
    );
  },

  getGithubActivities: async (candidateId, date) => {
    return makeAPIRequest(
      `/admin/candidates/${candidateId}/github-activities?date=${date}`
    );
  },

  getLinkedinActivities: async (candidateId, date) => {
    return makeAPIRequest(
      `/admin/candidates/${candidateId}/linkedin-activities?date=${date}`
    );
  },

  getPortfolio: async (candidateId) => {
    return makeAPIRequest(
      `/admin/candidates/${candidateId}/portfolio`
    );
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(config.JWT_STORAGE_KEY);
      localStorage.removeItem(config.USER_STORAGE_KEY);
      window.location.href = "/login";
    }
  }
};

export default authAPI;