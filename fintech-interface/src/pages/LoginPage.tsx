import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Eye, EyeOff, ArrowRight, Mail, Lock, Moon, Sun, Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useTheme } from "../context/ThemeContext";

const LoginPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper: decide where to redirect based on profile completeness
  const redirectUser = (user: any) => {
    if (user.profileComplete) {
      navigate("/dashboard");
    } else {
      navigate("/create-profile");
    }
  };

  // Google login
  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setError("");
      setLoading(true);
      try {
        // Get user info from Google
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((r) => r.json());

        // Try backend first
        try {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: tokenResponse.access_token, email: userInfo.email }),
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem("globepay-token", data.token);
            localStorage.setItem("globepay-user", JSON.stringify(data.user));
            redirectUser(data.user);
            return;
          }
        } catch {
          // Backend unavailable — fall through to demo mode
        }

        // Demo fallback: check if profile was previously completed locally
        const existingRaw = localStorage.getItem("globepay-user");
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        const isReturning = existing.email === userInfo.email && existing.profileComplete;

        const userObj = {
          ...(isReturning ? existing : {}),
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          firstName: existing.firstName || userInfo.given_name || "",
          lastName: existing.lastName || userInfo.family_name || "",
          picture: userInfo.picture,
          homeCurrency: existing.homeCurrency || "INR",
          profileComplete: isReturning ? true : false,
        };

        localStorage.setItem("globepay-token", tokenResponse.access_token);
        localStorage.setItem("globepay-user", JSON.stringify(userObj));
        redirectUser(userObj);
      } catch {
        setError("Google login failed. Try again.");
        setLoading(false);
      }
    },
    onError: () => setError("Google login was cancelled."),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      // Store token & redirect based on profile status
      localStorage.setItem("globepay-token", data.token);
      localStorage.setItem("globepay-user", JSON.stringify(data.user));
      redirectUser(data.user);
    } catch (err) {
      setError("Network error. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-surface-900 transition-colors duration-300">
      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-cyan-600 to-teal-700 items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white max-w-lg"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold">
              Globe<span className="text-white/80">Pay</span>
            </span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Welcome back to<br />
            <span className="text-white/80">GlobePay.</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Your money is where you left it. Check balances, send funds, and manage your global finances — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: "$2B+ transferred" },
              { label: "2M+ happy users" },
              { label: "180+ countries" },
              { label: "50+ currencies" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-white/80 text-sm">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col">
        {/* Minimal top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Globe<span className="gradient-text">Pay</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log in to GlobePay</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                Sign up
              </Link>
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              {/* Google Login */}
              <button
                type="button"
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-50 dark:bg-surface-900 px-4 text-gray-400 dark:text-gray-500">or log in with email</span>
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <button type="button" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-base flex items-center justify-center gap-2 !py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Log In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500">
              Protected by 256-bit encryption and AI-powered fraud detection.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
