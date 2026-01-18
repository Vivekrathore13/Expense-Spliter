import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../services/axiosinstance.js";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inviteToken = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !inviteToken) {
      navigate("/dashboard");
    }
  }, [inviteToken, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Please enter email and password!");
      return;
    }

    setLoading(true);
    try {
     const response = await axiosInstance.post("/login", {
  email: form.email.trim(),
  password: form.password.trim(),
});

// ✅ store token
const accessToken = response?.data?.data?.accessToken;
if (accessToken) localStorage.setItem("accessToken", accessToken);

// ✅ store user
const user = response?.data?.data?.user;
if (user) localStorage.setItem("user", JSON.stringify(user));

toast.success(response?.data?.message || "Login Successfully ✅");

      // ✅ redirect immediately (no need setTimeout)
      if (inviteToken) {
        navigate(`/join-group?token=${inviteToken}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl border border-blue-100 bg-white/80 backdrop-blur-md grid grid-cols-1 md:grid-cols-2">
          {/* LEFT */}
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <button
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700 transition w-fit"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mt-6">
              Welcome back to <br />
              <span className="text-blue-600">Expense Splitter</span>
            </h1>

            <p className="text-gray-600 mt-5 text-lg leading-relaxed">
              Login to continue splitting expenses, tracking balances and
              settling up instantly.
            </p>

            <p className="text-sm text-gray-500 mt-10">
              Don&apos;t have an account?{" "}
              <span
                onClick={() => {
                  if (inviteToken) navigate(`/signup?token=${inviteToken}`);
                  else navigate("/signup");
                }}
                className="text-blue-600 font-semibold cursor-pointer hover:underline"
              >
                Sign Up
              </span>
            </p>
          </div>

          {/* RIGHT */}
          <div className="relative p-10 md:p-14 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl bg-white/60 backdrop-blur-md border border-white/70 shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {inviteToken ? "Login to Accept Invite" : "Login"}
              </h2>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-3 focus-within:border-blue-500">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full outline-none text-gray-700 bg-transparent"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-3 focus-within:border-blue-500">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="w-full outline-none text-gray-700 bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl font-semibold text-white px-6 py-3 
                  bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg
                  hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]
                  transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Logging in...
                    </span>
                  ) : inviteToken ? (
                    "Login & Join Group"
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>

            <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-300/40 blur-2xl rounded-full"></div>
            <div className="absolute -bottom-8 -right-6 w-24 h-24 bg-indigo-400/40 blur-2xl rounded-full"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
