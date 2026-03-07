import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, User, Phone, MapPin, Wallet, ArrowRight, ArrowLeft,
  Check, Sparkles, ChevronDown,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* ── Supported currencies (self-contained) ── */
const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
];

/* ─── step definitions ─── */
const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Contact", icon: Phone },
  { id: 3, label: "Preferences", icon: Wallet },
];

/* ─── avatar colour options ─── */
const AVATAR_COLORS = [
  "from-brand-500 to-cyan-600",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-cyan-500 to-blue-500",
  "from-teal-500 to-sky-500",
];

const CreateProfilePage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  /* Pre-load any existing data (e.g. Google name) from localStorage */
  const existingUser = (() => {
    try {
      const raw = localStorage.getItem("globepay-user");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  })();

  /* form state — pre-fill from Google / previous data if available */
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(existingUser.firstName || "");
  const [lastName, setLastName] = useState(existingUser.lastName || "");
  const [phone, setPhone] = useState(existingUser.phone || "");
  const [country, setCountry] = useState(existingUser.country || "");
  const [city, setCity] = useState(existingUser.city || "");
  const [homeCurrency, setHomeCurrency] = useState(existingUser.homeCurrency || "INR");
  const [avatarColor, setAvatarColor] = useState(existingUser.avatarColor || AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* derived */
  const initials =
    (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "";

  /* ── step validation ── */
  const canProceed = (): boolean => {
    if (step === 1) return firstName.trim().length >= 2 && lastName.trim().length >= 1;
    if (step === 2) return phone.trim().length >= 6 && country.trim().length >= 2;
    return true;
  };

  /* ── save profile & go to dashboard ── */
  const handleFinish = async () => {
    setSaving(true);
    setError("");

    // Build the profile payload
    const existingRaw = localStorage.getItem("globepay-user");
    const existing = existingRaw ? JSON.parse(existingRaw) : {};

    const profile = {
      ...existing,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      phone,
      country,
      city,
      location: city ? `${city}, ${country}` : country,
      homeCurrency,
      avatarColor,
      initials,
      profileComplete: true,
    };

    // Try to persist to backend (if running)
    const token = localStorage.getItem("globepay-token");
    try {
      await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(profile),
      });
    } catch {
      // Backend unavailable — that's fine, we store locally
    }

    localStorage.setItem("globepay-user", JSON.stringify(profile));

    // Short celebration delay before redirecting
    await new Promise((r) => setTimeout(r, 800));
    navigate("/dashboard");
  };

  /* ── slide animation variants ── */
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (!canProceed()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  /* ── countries ── */
  const countries = [
    "India", "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "Japan", "Singapore", "UAE", "Brazil", "South Africa",
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-surface-900 transition-colors duration-300">
      {/* ── Left decorative panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-brand-600 via-cyan-600 to-teal-700 items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white max-w-md"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Globe<span className="text-white/80">Pay</span>
            </span>
          </div>

          {/* Live avatar preview */}
          <div className="flex flex-col items-center mb-10">
            <motion.div
              key={avatarColor}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-4xl font-bold shadow-xl`}
            >
              {initials}
            </motion.div>
            {(firstName || lastName) && (
              <motion.p
                key={firstName + lastName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-semibold mt-4"
              >
                {firstName} {lastName}
              </motion.p>
            )}
            <p className="text-white/60 text-sm mt-1">
              {city && country ? `${city}, ${country}` : "Complete your profile to get started"}
            </p>
          </div>

          <div className="space-y-3 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-300" /> Personalised dashboard
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-300" /> Instant multi-currency wallets
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-300" /> Pro member benefits unlocked
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-2 lg:hidden">
            <Globe className={`w-6 h-6 ${isDark ? "text-brand-400" : "text-brand-600"}`} />
            <span className="font-bold text-lg text-gray-900 dark:text-white">GlobePay</span>
          </div>
          <div className="hidden lg:block" />
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Step {step} of 3
          </span>
        </div>

        {/* Stepper */}
        <div className="px-6 lg:px-10 mb-6">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => {
                    if (s.id < step) { setDirection(-1); setStep(s.id); }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    s.id === step
                      ? "bg-brand-500 text-white"
                      : s.id < step
                      ? "bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 cursor-pointer"
                      : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-colors ${
                    s.id < step ? "bg-brand-400" : "bg-gray-200 dark:bg-white/10"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-start justify-center px-6 lg:px-10 overflow-hidden">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ─── Step 1: Personal Info ─── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Let's set up your profile
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                      Tell us a bit about yourself to personalise your experience.
                    </p>
                  </div>

                  {/* Avatar colour pick */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                      Choose avatar colour
                    </label>
                    <div className="flex gap-2">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setAvatarColor(c)}
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c} transition-all ${
                            avatarColor === c
                              ? "ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-surface-900 scale-110"
                              : "hover:scale-105"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Step 2: Contact & Location ─── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Where are you based?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                      This helps us optimise rates and suggest relevant features.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Phone */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Country *
                      </label>
                      <div className="relative">
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm appearance-none"
                        >
                          <option value="">Select country</option>
                          {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Step 3: Preferences ─── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Almost there!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                      Pick your home currency — you can always change it later.
                    </p>
                  </div>

                  {/* Currency grid */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 block">
                      Home Currency
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {currencies.map((cur) => (
                        <button
                          key={cur.code}
                          onClick={() => setHomeCurrency(cur.code)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all text-sm ${
                            homeCurrency === cur.code
                              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30"
                              : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
                          }`}
                        >
                          <span className="text-lg">{cur.flag}</span>
                          <div>
                            <p className="font-medium">{cur.code}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{cur.name}</p>
                          </div>
                          {homeCurrency === cur.code && (
                            <Check className="w-4 h-4 text-brand-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 dark:from-brand-500/5 dark:to-cyan-500/5 border border-brand-200/50 dark:border-brand-500/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-4 h-4 text-brand-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Profile Summary</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p><span className="font-medium">Name:</span> {firstName} {lastName}</p>
                      <p><span className="font-medium">Phone:</span> {phone}</p>
                      <p><span className="font-medium">Location:</span> {city ? `${city}, ${country}` : country}</p>
                      <p><span className="font-medium">Currency:</span> {homeCurrency}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="px-6 lg:px-10 py-6 border-t border-gray-200 dark:border-white/5">
          <div className="max-w-md mx-auto flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <div className="flex-1" />
            {step < 3 ? (
              <button
                onClick={goNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/25"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-cyan-600 hover:from-brand-600 hover:to-cyan-700 disabled:opacity-60 transition-all shadow-lg shadow-brand-500/25"
              >
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Setting up…
                  </>
                ) : (
                  <>
                    Launch Dashboard <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfilePage;
