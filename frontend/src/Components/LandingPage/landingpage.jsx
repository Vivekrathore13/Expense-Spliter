import React from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ yaha tum apni image ka path doge
import ExpenseHeroImg from "./Newexpense.png"; 
// 👆 Example: tum apni image ko same folder me rakh ke name `expense-hero.png` kar do

const LandingP = () => {
  const navigate=useNavigate();
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl rounded-[32px] overflow-hidden shadow-2xl border border-blue-100 bg-white/80 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* LEFT */}
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Welcome to <br />
              <span className="text-blue-600">Expense Splitter</span>
            </h1>

            <p className="text-gray-600 mt-4 text-lg leading-relaxed">
              Manage & share expenses with ease. Split bills, track balances and settle up instantly.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-9">
              {/* Get Started */}
              <button
              onClick={()=>navigate('/signup')
              }
                className="group inline-flex items-center justify-center px-8 py-3 rounded-2xl font-semibold text-white 
                bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg
                hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98]
                transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              {/* Login */}
              <button
              onClick={()=>navigate('/login')}
                className="group inline-flex items-center justify-center px-8 py-3 rounded-2xl font-semibold 
                text-blue-700 border border-blue-300 bg-white/70 backdrop-blur-md shadow-md
                hover:bg-blue-50 hover:border-blue-500 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300"
              >
                <LogIn className="mr-2 w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
                Login
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-10">
              Track and split expenses with your friends and family.{" "}
              <span className="text-blue-600 font-semibold">
                No confusion, only clarity ✅
              </span>
            </p>
          </div>

          {/* RIGHT (REAL IMAGE) */}
          <div className="relative p-10 md:p-14 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <div className="bg-white/50 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
              <img
                src={ExpenseHeroImg}
                alt="Expense Splitter Illustration"
                className="w-full max-w-lg rounded-2xl"
              />
            </div>

            {/* Glow bubbles */}
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-300/40 blur-2xl rounded-full"></div>
            <div className="absolute -bottom-8 -right-6 w-24 h-24 bg-indigo-400/40 blur-2xl rounded-full"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandingP;
