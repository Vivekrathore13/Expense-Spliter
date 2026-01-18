import React from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ExpenseHeroImg from "./Newexpense.png";

const wrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

const LandingP = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-10">
      {/* BG */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,0.22)_0%,rgba(59,130,246,0)_40%),radial-gradient(circle_at_86%_22%,rgba(168,85,247,0.18)_0%,rgba(168,85,247,0)_45%),radial-gradient(circle_at_52%_92%,rgba(14,165,233,0.16)_0%,rgba(14,165,233,0)_40%),linear-gradient(135deg,#EEF2FF_0%,#E9D5FF_45%,#DBEAFE_100%)]" />

      {/* Floating glow blobs (NOW FLOATY ✅) */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl animate-floaty" />
      <div className="pointer-events-none absolute top-20 -right-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-floaty2" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl animate-floaty" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={wrap}
        className="relative w-full max-w-6xl rounded-[32px] overflow-hidden border border-white/45 bg-white/40 backdrop-blur-2xl shadow-[0_20px_65px_rgba(0,0,0,0.16)]"
      >
        {/* Border shine overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/50" />
        <div className="pointer-events-none absolute -inset-[2px] bg-gradient-to-r from-white/0 via-white/35 to-white/0 opacity-30 blur-xl" />

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT */}
          <motion.div
            variants={fadeLeft}
            className="p-10 md:p-14 flex flex-col justify-center"
          >
            <motion.div variants={fadeUp} className="w-fit">
              <div className="px-4 py-2 rounded-full border border-white/55 bg-white/55 backdrop-blur-xl shadow-sm text-sm font-semibold text-gray-800">
                ✨ Premium Expense Manager
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-7 text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
            >
              Welcome to <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Expense Splitter
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-gray-700/90 mt-4 text-lg leading-relaxed"
            >
              Split bills, track balances & settle up instantly — with a clean,
              premium experience.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mt-9">
              <motion.button
                whileHover={{ scale: 1.035 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => navigate("/signup")}
                className="group inline-flex items-center justify-center px-8 py-3 rounded-2xl font-semibold text-white 
                bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg
                hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
              >
                {/* shine */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_55%)]" />
                <span className="absolute -left-1/2 top-0 h-full w-1/2 bg-white/25 skew-x-[-20deg] translate-x-[-180%] group-hover:translate-x-[250%] transition-transform duration-700" />

                <span className="relative flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => navigate("/login")}
                className="group inline-flex items-center justify-center px-8 py-3 rounded-2xl font-semibold 
                text-gray-900 border border-white/65 bg-white/55 backdrop-blur-xl shadow-md
                hover:bg-white/70 hover:shadow-xl transition-all duration-300"
              >
                <LogIn className="mr-2 w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
                Login
              </motion.button>
            </motion.div>

            <motion.p variants={fadeUp} className="text-sm text-gray-700/80 mt-10">
              Track and split expenses with friends & family.{" "}
              <span className="text-blue-700 font-semibold">
                No confusion, only clarity ✅
              </span>
            </motion.p>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            variants={fadeRight}
            className="relative p-10 md:p-14 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-white/20" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10" />

            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="relative w-full"
            >
              <motion.div
                whileHover={{ y: -8, rotate: -0.5 }}
                transition={{ type: "spring", stiffness: 160, damping: 16 }}
                className="mx-auto max-w-lg rounded-3xl bg-white/45 backdrop-blur-2xl border border-white/60 shadow-[0_25px_60px_rgba(0,0,0,0.16)] p-6"
              >
                <img
                  src={ExpenseHeroImg}
                  alt="Expense Splitter Illustration"
                  className="w-full rounded-2xl"
                />
              </motion.div>

              {/* glow rings */}
              <div className="pointer-events-none absolute -top-6 -left-8 h-24 w-24 rounded-full bg-blue-400/25 blur-2xl animate-floaty" />
              <div className="pointer-events-none absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-indigo-500/25 blur-2xl animate-floaty2" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-4 text-xs text-gray-600/70">
        Built with ❤️ — Premium UI Theme
      </div>
    </div>
  );
};

export default LandingP;
