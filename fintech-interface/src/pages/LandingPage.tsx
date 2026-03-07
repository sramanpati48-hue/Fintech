import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, ArrowRight, Star, Wallet, Zap, QrCode, TrendingUp,
  Shield, BarChart3, Moon, Sun, ChevronDown, Menu, X,
  CreditCard, Smartphone, Users, Clock, CheckCircle,
  ArrowLeftRight, Send, Lock, Sparkles, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* ── Static marketing data (self-contained) ── */
const features = [
  { title: "Multi-Currency Wallets", description: "Hold and manage money in 50+ currencies. Instant conversion at the real exchange rate.", icon: "wallet" },
  { title: "Lightning-Fast Transfers", description: "Send money globally in seconds, not days. Available in 180+ countries worldwide.", icon: "zap" },
  { title: "QR Code Payments", description: "Scan and pay internationally with a single tap. No more fumbling with bank details.", icon: "qrcode" },
  { title: "Real-Time Rates", description: "Get the real mid-market exchange rate. No hidden markups, no surprises.", icon: "trending" },
  { title: "Bank-Level Security", description: "256-bit encryption, biometric auth, and real-time fraud monitoring keep your money safe.", icon: "shield" },
  { title: "Smart Analytics", description: "Track spending patterns, set budgets, and get insights across all your currencies.", icon: "chart" },
];

const testimonials = [
  { name: "Sarah Chen", role: "Freelance Designer", avatar: "SC", text: "GlobePay has completely changed how I receive payments from international clients. The rates are incredible and transfers are almost instant.", rating: 5 },
  { name: "Marcus Johnson", role: "Digital Nomad", avatar: "MJ", text: "I travel between 6 countries a year. GlobePay's multi-currency wallet saves me hundreds in conversion fees every month.", rating: 5 },
  { name: "Aisha Patel", role: "Remote Engineer", avatar: "AP", text: "The QR code payments are a game-changer. I can pay in local currency anywhere without worrying about exchange rates.", rating: 5 },
];

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

const iconMap: Record<string, React.ReactNode> = {
  wallet: <Wallet className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  qrcode: <QrCode className="w-6 h-6" />,
  trending: <TrendingUp className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  chart: <BarChart3 className="w-6 h-6" />,
};

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as any },
  }),
} as any;

/* ── hero slides data ── */
const heroSlides = [
  {
    badge: "🌍 180+ Countries",
    heading: (
      <>
        Send money{" "}
        <span className="gradient-text">globally,</span>
        <br />
        pay <span className="gradient-text">locally.</span>
      </>
    ),
    subtext:
      "The smartest way to send, spend, and receive money across borders. Real exchange rates, zero hidden fees, instant transfers.",
  },
  {
    badge: "⚡ Instant Transfers",
    heading: (
      <>
        Lightning-fast{" "}
        <span className="gradient-text">transfers</span>
        <br />
        in <span className="gradient-text">seconds.</span>
      </>
    ),
    subtext:
      "Why wait days? Send money across the world in seconds with real-time settlement and live tracking.",
  },
  {
    badge: "🔒 Bank-Level Security",
    heading: (
      <>
        Your money,{" "}
        <span className="gradient-text">always</span>
        <br />
        <span className="gradient-text">protected.</span>
      </>
    ),
    subtext:
      "256-bit encryption, biometric authentication, and AI-powered fraud detection keep every transaction safe.",
  },
  {
    badge: "💳 Multi-Currency",
    heading: (
      <>
        One wallet,{" "}
        <span className="gradient-text">50+</span>
        <br />
        <span className="gradient-text">currencies.</span>
      </>
    ),
    subtext:
      "Hold, convert, and spend in 50+ currencies. Get the real mid-market rate every time you convert.",
  },
];

/* ── floating currency data ── */
const floatingCurrencies = [
  { symbol: "$", flag: "🇺🇸", x: "10%", y: "20%", delay: 0, duration: 6 },
  { symbol: "€", flag: "🇪🇺", x: "85%", y: "15%", delay: 1, duration: 7 },
  { symbol: "£", flag: "🇬🇧", x: "75%", y: "70%", delay: 2, duration: 8 },
  { symbol: "¥", flag: "🇯🇵", x: "15%", y: "75%", delay: 0.5, duration: 6.5 },
  { symbol: "₹", flag: "🇮🇳", x: "90%", y: "45%", delay: 1.5, duration: 7.5 },
  { symbol: "A$", flag: "🇦🇺", x: "5%", y: "50%", delay: 3, duration: 8 },
];

/* ── partner logos ── */
const partnerLogos = [
  "GlobalPay Connect", "SwiftLedger", "NexaPay", "VaultBridge",
  "FinRelay Pro", "PayRoute", "ClearSettle", "ArcTransact",
  "TrustWire", "PrimeLedger", "QuickRemit", "SecureFund",
];

/* ── stats ── */
const stats = [
  { value: "$2B+", label: "Transferred", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
  { value: "2M+", label: "Happy Users", icon: Users, color: "from-blue-500 to-cyan-500" },
  { value: "180+", label: "Countries", icon: Globe, color: "from-cyan-500 to-teal-500" },
  { value: "50+", label: "Currencies", icon: CreditCard, color: "from-orange-500 to-amber-500" },
];

/* ── how it works ── */
const steps = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up in 2 minutes with just your email. No paperwork, no branch visits.",
    icon: Smartphone,
    color: "from-brand-500 to-brand-500",
    link: "/signup",
  },
  {
    step: "02",
    title: "Add funds & convert",
    desc: "Fund your wallet instantly via bank transfer, card, or Apple Pay. Convert at real rates.",
    icon: ArrowLeftRight,
    color: "from-cyan-500 to-teal-500",
    link: "/convert",
  },
  {
    step: "03",
    title: "Send & spend globally",
    desc: "Transfer money to 180+ countries or spend with your virtual card — all in seconds.",
    icon: Send,
    color: "from-pink-500 to-rose-500",
    link: "/send",
  },
];

/* ── app screenshots ── */
const screenshots = [
  { title: "Dashboard", desc: "See all your wallets at a glance", gradient: "from-brand-600 via-cyan-600 to-teal-600" },
  { title: "Send Money", desc: "Transfer in 3 easy steps", gradient: "from-blue-600 via-cyan-500 to-teal-500" },
  { title: "Cards", desc: "Virtual cards for online shopping", gradient: "from-orange-500 via-pink-500 to-rose-500" },
  { title: "Analytics", desc: "Track spending with smart insights", gradient: "from-emerald-500 via-green-500 to-lime-500" },
  { title: "QR Payments", desc: "Scan & pay instantly anywhere", gradient: "from-cyan-600 via-sky-500 to-pink-500" },
];

/* ── live rate ticker ── */
const tickerRates = [
  { pair: "USD/EUR", rate: "0.9234", change: "+0.12%" },
  { pair: "GBP/USD", rate: "1.2673", change: "-0.08%" },
  { pair: "USD/JPY", rate: "149.52", change: "+0.45%" },
  { pair: "EUR/GBP", rate: "0.8546", change: "+0.15%" },
  { pair: "USD/INR", rate: "83.12", change: "-0.22%" },
  { pair: "AUD/USD", rate: "0.6543", change: "+0.18%" },
  { pair: "USD/CAD", rate: "1.3621", change: "-0.05%" },
  { pair: "CHF/USD", rate: "1.1234", change: "+0.09%" },
];

/* ============================================================ */
const LandingPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("1000");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenshotIdx, setScreenshotIdx] = useState(0);

  const convertedAmount = (parseFloat(amount || "0") * 0.9234).toFixed(2);

  /* Auto-advance hero slideshow */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* Auto-advance screenshots */
  useEffect(() => {
    const interval = setInterval(() => {
      setScreenshotIdx((prev) => (prev + 1) % screenshots.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900 transition-colors duration-300 overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Globe<span className="gradient-text">Pay</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "How It Works", "Rates", "Reviews"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600 transition-colors px-4 py-2">
                Log In
              </Link>
              <a href="#how-it-works" className="btn-primary text-sm !px-5 !py-2.5">
                Get Started
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-white/5 bg-white dark:bg-surface-800 px-4 py-4 space-y-3"
          >
            {["Features", "How It Works", "Rates", "Reviews"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="block py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                {item}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <a href="#how-it-works" className="btn-primary text-sm flex-1 text-center">Get Started</a>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ===== LIVE RATE TICKER BAR ===== */}
      <div className="fixed top-16 w-full z-40 bg-gray-900 dark:bg-black py-1.5 overflow-hidden border-b border-gray-800">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...tickerRates, ...tickerRates].map((r, i) => (
            <div key={i} className="inline-flex items-center gap-3 mx-6">
              <span className="text-xs font-medium text-gray-400">{r.pair}</span>
              <span className="text-xs font-bold text-white">{r.rate}</span>
              <span className={`text-[10px] font-semibold ${r.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                {r.change}
              </span>
              <span className="text-gray-700">│</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== HERO SECTION WITH SLIDESHOW ===== */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating Currency Bubbles */}
        {floatingCurrencies.map((c, i) => (
          <motion.div
            key={i}
            className="absolute hidden lg:flex items-center gap-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-gray-200/50 dark:border-white/10"
            style={{ left: c.x, top: c.y }}
            animate={{ y: [0, -20, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: c.duration, repeat: Infinity, delay: c.delay, ease: "easeInOut" }}
          >
            <span className="text-lg">{c.flag}</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{c.symbol}</span>
          </motion.div>
        ))}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Slideshow */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-full px-4 py-1.5 mb-8">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                    {heroSlides[currentSlide].badge}
                  </span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                  {heroSlides[currentSlide].heading}
                </h1>

                <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  {heroSlides[currentSlide].subtext}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === i ? "w-8 h-2 bg-brand-500" : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-brand-300"
                  }`}
                />
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a href="#how-it-works" className="btn-primary text-base flex items-center gap-2 !px-8 !py-4 group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#how-it-works" className="btn-secondary text-base flex items-center gap-2 !px-8 !py-4">
                See How It Works
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500"
            >
              {[
                { icon: Shield, text: "Bank-level security", color: "text-green-500" },
                { icon: Zap, text: "Instant transfers", color: "text-yellow-500" },
                { icon: Lock, text: "FCA regulated", color: "text-blue-500" },
              ].map((badge, i) => (
                <React.Fragment key={badge.text}>
                  {i > 0 && <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />}
                  <div className="flex items-center gap-1.5">
                    <badge.icon className={`w-4 h-4 ${badge.color}`} />
                    <span>{badge.text}</span>
                  </div>
                </React.Fragment>
              ))}
            </motion.div>
          </div>

          {/* Hero Card Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="glass-card p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-brand-500/20 to-cyan-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex flex-col sm:flex-row items-center gap-6 relative">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Balance</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">$26,411.50</p>
                  <p className="text-sm text-green-500 mt-1 font-medium flex items-center gap-1 justify-center sm:justify-start">
                    <TrendingUp className="w-3.5 h-3.5" /> 12.5% this month
                  </p>
                </div>
                <div className="flex gap-3">
                  {[
                    { flag: "🇺🇸", code: "USD", bal: "$12,450" },
                    { flag: "🇪🇺", code: "EUR", bal: "€8,320" },
                    { flag: "🇬🇧", code: "GBP", bal: "£5,640" },
                  ].map((c) => (
                    <div key={c.code} className="bg-gray-100 dark:bg-white/5 rounded-xl px-4 py-3 text-center hover:scale-105 transition-transform cursor-pointer">
                      <span className="text-lg block">{c.flag}</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block mt-0.5">{c.bal}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{c.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PARTNER LOGOS MARQUEE ===== */}
      <section className="py-10 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-surface-800/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <p className="text-center text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Trusted by global payment platforms
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-surface-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 dark:from-surface-900 to-transparent z-10 pointer-events-none" />
          <div className="animate-marquee flex whitespace-nowrap">
            {[...partnerLogos, ...partnerLogos].map((name, i) => (
              <div key={i} className="inline-flex items-center mx-8 px-6 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-wider">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ANIMATED STATS COUNTER ===== */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, scale: 1.03 }}
                className="relative glass-card p-6 text-center group hover:shadow-glow transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-20 lg:py-32 bg-gray-50/50 dark:bg-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-500/10 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">Features</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Everything you need to{" "}
              <span className="gradient-text">go global</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built for the way the world works today. Fast, transparent, and designed for global citizens.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature: any, i: number) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card p-6 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-cyan-500/0 group-hover:from-brand-500/5 group-hover:to-cyan-500/5 transition-all duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/10 to-cyan-500/10 dark:from-brand-500/20 dark:to-cyan-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {iconMap[feature.icon]}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-brand-500/5 to-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-500/10 rounded-full px-4 py-1.5 mb-4">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">Simple Process</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Get started in{" "}
              <span className="gradient-text">3 easy steps</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From sign-up to sending money globally — it takes less than 5 minutes.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-brand-500/30 via-cyan-500/30 to-pink-500/30" />

            {steps.map((step, i) => (
              <Link key={step.step} to={step.link} className="no-underline">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -6 }}
                  className="relative text-center cursor-pointer group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mx-auto mb-6 shadow-lg relative z-10 group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <step.icon className="w-9 h-9" />
                  </motion.div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-surface-900 border-2 border-brand-500 flex items-center justify-center text-xs font-bold text-brand-600 -mt-2 z-20">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {step.step === "01" ? "Sign Up" : step.title} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== APP SCREENSHOTS CAROUSEL ===== */}
      <section className="py-20 lg:py-32 bg-gray-50/50 dark:bg-surface-800/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-cyan-50 dark:bg-cyan-500/10 rounded-full px-4 py-1.5 mb-4">
              <Smartphone className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">App Preview</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Beautiful on{" "}
              <span className="gradient-text">every screen</span>
            </motion.h2>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 h-80">
              {screenshots.map((ss, i) => {
                const offset = i - screenshotIdx;
                const absOffset = Math.abs(offset);
                const isCenter = offset === 0;

                return (
                  <motion.div
                    key={ss.title}
                    animate={{
                      scale: isCenter ? 1 : 0.85 - absOffset * 0.05,
                      opacity: absOffset > 2 ? 0 : isCenter ? 1 : 0.5,
                      x: offset * 220,
                      zIndex: isCenter ? 10 : 5 - absOffset,
                      rotateY: offset * -5,
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute w-64 h-72 cursor-pointer"
                    onClick={() => setScreenshotIdx(i)}
                  >
                    <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${ss.gradient} p-6 flex flex-col justify-between text-white shadow-2xl`}>
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                          <Globe className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold">{ss.title}</h4>
                        <p className="text-sm text-white/70 mt-1">{ss.desc}</p>
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3].map((line) => (
                          <div key={line} className="h-2 rounded-full bg-white/20" style={{ width: `${100 - line * 15}%` }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setScreenshotIdx((p) => (p - 1 + screenshots.length) % screenshots.length)}
                className="w-10 h-10 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex gap-2">
                {screenshots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setScreenshotIdx(i)}
                    className={`transition-all duration-300 rounded-full ${
                      screenshotIdx === i ? "w-8 h-2 bg-brand-500" : "w-2 h-2 bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setScreenshotIdx((p) => (p + 1) % screenshots.length)}
                className="w-10 h-10 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CURRENCY CONVERTER ===== */}
      <section id="rates" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 rounded-full px-4 py-1.5 mb-4">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Real-Time Rates</span>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Convert at the{" "}
                <span className="gradient-text">real exchange rate</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                Unlike banks and other services, GlobePay uses the real mid-market exchange rate.
                No hidden markups — what you see is what you get.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="mt-8 space-y-4">
                {[
                  { label: "Mid-market rate", desc: "The fairest rate available", icon: TrendingUp },
                  { label: "Transparent fees", desc: "As low as 0.35% per transfer", icon: Shield },
                  { label: "Rate alerts", desc: "Get notified when rates change", icon: Clock },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="glass-card p-6 sm:p-8 max-w-md mx-auto lg:ml-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Currency Converter</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">You send</label>
                    <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-transparent px-4 py-3.5 text-gray-900 dark:text-white text-lg font-semibold outline-none"
                      />
                      <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="bg-transparent text-gray-700 dark:text-gray-300 font-medium px-3 outline-none cursor-pointer">
                        {currencies.map((c: any) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                      <ChevronDown className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">They receive</label>
                    <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                      <div className="flex-1 px-4 py-3.5 text-green-600 dark:text-green-400 text-lg font-semibold">{convertedAmount}</div>
                      <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="bg-transparent text-gray-700 dark:text-gray-300 font-medium px-3 outline-none cursor-pointer">
                        {currencies.map((c: any) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="bg-brand-50/50 dark:bg-brand-500/5 rounded-xl p-3 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Exchange rate</span>
                      <span className="font-medium text-gray-900 dark:text-white">1 USD = 0.9234 EUR</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Fee</span>
                      <span className="font-medium text-green-600">$3.50 (0.35%)</span>
                    </div>
                  </div>
                  <Link to="/send" className="btn-primary w-full text-center block mt-4">Send Money Now</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="reviews" className="py-20 lg:py-32 bg-gray-50/50 dark:bg-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-full px-4 py-1.5 mb-4">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Testimonials</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Loved by{" "}
              <span className="gradient-text">global citizens</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Don't just take our word for it — hear from our users.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t: any, i: number) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4 }}
                className="glass-card p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_: any, j: number) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 relative">"{t.text}"</p>
                <div className="flex items-center gap-3 relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Review summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 glass-card p-6 flex flex-wrap items-center justify-center gap-8"
          >
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">4.9</span>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">2,847 reviews</p>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">98%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Would recommend</p>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">#1</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Finance App 2026</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 via-cyan-600 to-teal-600 p-10 sm:p-16 text-center"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl" />
              <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl"
              />
            </div>
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6"
              >
                <Globe className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Ready to go<br />borderless?
              </h2>
              <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto">
                Join 2 million+ users who trust GlobePay for fast, transparent, and affordable global payments.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="bg-white text-brand-700 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center gap-2 shadow-lg group">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#rates" className="text-white/90 font-semibold px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 transition-all flex items-center gap-2">
                  View Rates
                </a>
              </div>
              <p className="mt-6 text-white/50 text-sm flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                No credit card required · Free forever plan available
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-200 dark:border-white/5 py-12 bg-white dark:bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-600 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Globe<span className="gradient-text">Pay</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed max-w-xs">
                The smartest way to send, spend, and receive money globally. Trusted by 2M+ users in 180+ countries.
              </p>
              <div className="flex gap-3 mt-4">
                {["Twitter", "LinkedIn", "GitHub", "Discord"].map((social) => (
                  <button key={social} className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-colors text-xs font-bold">
                    {social[0]}
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "API", "Integrations"] },
              { title: "Company", links: ["About", "Careers", "Blog", "Press", "Partners"] },
              { title: "Support", links: ["Help Center", "Contact", "Status", "Legal", "Privacy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">{col.title}</h4>
                <div className="space-y-3">
                  {col.links.map((link) => (
                    <button key={link} className="block text-sm text-gray-500 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-left">{link}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 dark:text-gray-600">© 2026 GlobePay. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-600">
              <button className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy</button>
              <button className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms</button>
              <button className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
