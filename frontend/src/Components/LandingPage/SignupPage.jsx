import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../services/axiosinstance.js";
import { motion } from "framer-motion";

const fadeLeft = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const inviteToken = new URLSearchParams(location.search).get("token");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Please fill all required fields!");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/signup", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      });

      toast.success(response?.data?.message || "Signup Successful ✅");

      setTimeout(() => {
        if (inviteToken) navigate(`/join-group?token=${inviteToken}`);
        else navigate("/login");
      }, 900);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-10">
        {/* BG */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,0.22)_0%,rgba(59,130,246,0)_40%),radial-gradient(circle_at_86%_22%,rgba(168,85,247,0.18)_0%,rgba(168,85,247,0)_45%),radial-gradient(circle_at_52%_92%,rgba(14,165,233,0.16)_0%,rgba(14,165,233,0)_40%),linear-gradient(135deg,#EEF2FF_0%,#E9D5FF_45%,#DBEAFE_100%)]" />

        {/* Floating glow blobs */}
        <div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl animate-floaty" />
        <div className="pointer-events-none absolute top-20 -right-28 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-floaty2" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl animate-floaty" />

        <motion.div
          initial="hidden"
          animate="show"
          className="relative w-full max-w-5xl rounded-[32px] overflow-hidden border border-white/45 bg-white/40 backdrop-blur-2xl shadow-[0_20px_65px_rgba(0,0,0,0.16)] grid grid-cols-1 md:grid-cols-2"
        >
          {/* LEFT */}
          <motion.div variants={fadeLeft} className="p-10 md:p-14 flex flex-col justify-center">
            <div className="w-fit px-4 py-2 rounded-full border border-white/55 bg-white/55 backdrop-blur-xl shadow-sm text-sm font-semibold text-gray-800">
              🚀 Start Splitting Smarter
            </div>

            <h1 className="mt-7 text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Create your <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Expense Splitter
              </span>{" "}
              account
            </h1>

            <p className="text-gray-700/90 mt-5 text-lg leading-relaxed">
              Start splitting expenses with friends and family. Track who owes what & settle up instantly.
            </p>

            <div className="mt-8 space-y-3 text-gray-700/80 text-sm">
              <p>✅ Quick Signup</p>
              <p>✅ Secure Authentication</p>
              <p>✅ Real-time Balances</p>
              {inviteToken && (
                <p className="text-blue-700 font-semibold">
                  ✅ Invite detected — you will join group after signup
                </p>
              )}
            </div>

            <p className="text-sm text-gray-700/70 mt-10">
              Already have an account?{" "}
              <span
                onClick={() => (inviteToken ? navigate(`/login?token=${inviteToken}`) : navigate("/login"))}
                className="text-blue-700 font-semibold cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </motion.div>

          {/* RIGHT FORM */}
          <motion.div variants={fadeRight} className="relative p-10 md:p-14 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/20" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10" />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.975 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-3xl bg-white/55 backdrop-blur-2xl border border-white/60 shadow-[0_22px_55px_rgba(0,0,0,0.16)] p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                {inviteToken ? "Sign up to Accept Invite" : "Sign Up"}
              </h2>

              <p className="text-gray-700/80 mt-1 text-sm">
                Please enter your details to create account.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                {/* Full Name */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex items-center gap-2 bg-white/75 rounded-xl border border-white/70 px-4 py-3 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-200">
                    <User className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full outline-none text-gray-800 bg-transparent placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex items-center gap-2 bg-white/75 rounded-xl border border-white/70 px-4 py-3 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-200">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full outline-none text-gray-800 bg-transparent placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex items-center gap-2 bg-white/75 rounded-xl border border-white/70 px-4 py-3 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-200">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className="w-full outline-none text-gray-800 bg-transparent placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl font-semibold text-white px-6 py-3 
                  bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg
                  hover:shadow-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_60%)]" />
                  <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-white/25 skew-x-[-20deg] translate-x-[-180%] hover:translate-x-[250%] transition-transform duration-700" />
                  <span className="relative">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </span>
                    ) : inviteToken ? (
                      "Sign Up & Join Group"
                    ) : (
                      "Create Account"
                    )}
                  </span>
                </motion.button>
              </form>
            </motion.div>

            <div className="pointer-events-none absolute -top-6 -left-6 w-20 h-20 bg-blue-300/35 blur-2xl rounded-full animate-floaty" />
            <div className="pointer-events-none absolute -bottom-8 -right-6 w-24 h-24 bg-indigo-400/35 blur-2xl rounded-full animate-floaty2" />
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Signup;
