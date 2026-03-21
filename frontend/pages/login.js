import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { validateEmail, loginUser, getCurrentUser } from "../utils/auth";
import authAPI from "../services/authAPI";

export default function AdminLogin() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [showForgotMsg, setShowForgotMsg] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();

    if (user && user.user_type === "admin") {
      router.push("/admin_dashboard");
    }
  }, [router]);

  useEffect(() => {
    setEmailValid(validateEmail(email));
  }, [email]);

  
  const handleLogin = async (e) => {

    e.preventDefault();

    if (!emailValid) {
      return toast.error("Enter valid email");
    }

    if (!password) {
      return toast.error("Enter password");
    }

    setLoading(true);

    try {

      const response = await authAPI.adminLogin(email, password);

      loginUser(response);

      window.dispatchEvent(new Event("authChanged"));

      toast.success("Welcome Admin");

      router.push("/dashboard");

    } 
    catch (error) {

      let msg = "Login failed";

      try {

        const parsed = JSON.parse(error.message);

        msg = parsed?.error || parsed?.message || msg;

      } 
      catch {

        msg = error?.message || msg;

      }

      toast.error(msg);

    } 
    finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] px-4">

      <div className="max-w-md w-full bg-white dark:bg-[#1e2633]/95 p-10 rounded-3xl shadow-2xl border border-gray-200 dark:border-purple-500/20">

        <div className="text-center mb-6">

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {showForgotMsg ? "Forgot Password" : "Admin Login"}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {showForgotMsg
              ? "Contact super admin to reset password"
              : "Sign in to admin dashboard"}
          </p>

        </div>

        {showForgotMsg ? (

          <div className="space-y-6">

            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-sm text-center">
              Please contact <span className="font-semibold">admin@jobsyme.com</span> to reset password.
            </div>

            <button
              onClick={() => setShowForgotMsg(false)}
              className="w-full p-3 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white"
            >
              Back to Login
            </button>

          </div>

        ) : (

          <form onSubmit={handleLogin} className="space-y-6">

            <div className="relative">

              <input
                type="email"
                placeholder="Admin email"
                className="w-full p-3 border rounded-lg bg-white dark:bg-[#1e2633] text-gray-900 dark:text-white border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {email && (
                <div className="absolute right-3 top-3">
                  {emailValid ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )}
                </div>
              )}

            </div>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-3 border rounded-lg bg-white dark:bg-[#1e2633] text-gray-900 dark:text-white border-gray-300 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>

            </div>

            <div className="text-right">

              <button
                type="button"
                onClick={() => setShowForgotMsg(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>

            </div>

            <button
              type="submit"
              disabled={loading || !emailValid || !password}
              className="w-full p-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

          </form>

        )}

      </div>

    </div>

  );

}