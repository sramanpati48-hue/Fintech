import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Plus, TrendingUp, Calendar, CheckCircle, Pencil,
  Trash2, PiggyBank, Plane, GraduationCap, Home, Car, Gift, X,
  Sparkles,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
  }),
} as any;

interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  autoSave: number;
  category: string;
}

const goalIcons: Record<string, any> = {
  vacation: Plane,
  education: GraduationCap,
  home: Home,
  car: Car,
  gift: Gift,
  emergency: PiggyBank,
  default: Target,
};

const initialGoals: SavingsGoal[] = [
  {
    id: "1", name: "Dream Vacation", icon: "vacation", targetAmount: 5000, currentAmount: 3250,
    deadline: "2026-08-15", color: "from-blue-500 to-cyan-500", autoSave: 200, category: "Travel",
  },
  {
    id: "2", name: "Emergency Fund", icon: "emergency", targetAmount: 10000, currentAmount: 7800,
    deadline: "2026-12-31", color: "from-green-500 to-emerald-500", autoSave: 500, category: "Safety",
  },
  {
    id: "3", name: "New Laptop", icon: "gift", targetAmount: 2500, currentAmount: 1200,
    deadline: "2026-06-01", color: "from-cyan-500 to-teal-500", autoSave: 150, category: "Tech",
  },
  {
    id: "4", name: "Home Down Payment", icon: "home", targetAmount: 50000, currentAmount: 18500,
    deadline: "2028-01-01", color: "from-orange-500 to-amber-500", autoSave: 1000, category: "Housing",
  },
  {
    id: "5", name: "Car Fund", icon: "car", targetAmount: 15000, currentAmount: 15000,
    deadline: "2026-03-01", color: "from-pink-500 to-rose-500", autoSave: 0, category: "Transport",
  },
];

/* Circular progress ring component */
const CircularProgress: React.FC<{ percentage: number; color: string; size?: number; strokeWidth?: number }> = ({
  percentage, color, size = 80, strokeWidth = 6,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="currentColor" fill="none"
        className="text-gray-200 dark:text-white/10" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="url(#progressGrad)" fill="none"
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        strokeDasharray={circumference}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const SavingsGoalsPage: React.FC = () => {
  const [goals, setGoals] = useState(initialGoals);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalAutoSave, setNewGoalAutoSave] = useState("");
  const [newGoalIcon, setNewGoalIcon] = useState("default");

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallProgress = Math.round((totalSaved / totalTarget) * 100);
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const monthlySaving = goals.reduce((acc, g) => acc + g.autoSave, 0);

  const handleAddGoal = () => {
    if (!newGoalName || !newGoalTarget) return;
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoalName,
      icon: newGoalIcon,
      targetAmount: parseFloat(newGoalTarget),
      currentAmount: 0,
      deadline: newGoalDeadline || "2027-01-01",
      color: ["from-blue-500 to-cyan-500", "from-green-500 to-emerald-500", "from-cyan-500 to-teal-500", "from-orange-500 to-amber-500"][Math.floor(Math.random() * 4)],
      autoSave: parseFloat(newGoalAutoSave) || 0,
      category: "Custom",
    };
    setGoals([...goals, newGoal]);
    setShowAddModal(false);
    setNewGoalName("");
    setNewGoalTarget("");
    setNewGoalDeadline("");
    setNewGoalAutoSave("");
    setNewGoalIcon("default");
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const handleAddFunds = (id: string) => {
    setGoals(goals.map((g) => {
      if (g.id === id) {
        const newAmount = Math.min(g.currentAmount + 100, g.targetAmount);
        return { ...g, currentAmount: newAmount };
      }
      return g;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your progress toward financial freedom.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 !px-5 !py-2.5 text-sm w-fit">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </motion.div>

      {/* Overview Cards */}
      <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Saved", value: `$${totalSaved.toLocaleString()}`, icon: PiggyBank, color: "from-brand-500 to-cyan-500", sub: `of $${totalTarget.toLocaleString()}` },
          { label: "Overall Progress", value: `${overallProgress}%`, icon: Target, color: "from-green-500 to-emerald-500", sub: "toward all goals" },
          { label: "Goals Completed", value: `${completedGoals}/${goals.length}`, icon: CheckCircle, color: "from-blue-500 to-cyan-500", sub: "goals achieved" },
          { label: "Monthly Auto-Save", value: `$${monthlySaving.toLocaleString()}`, icon: Calendar, color: "from-orange-500 to-amber-500", sub: "per month" },
        ].map((card, i) => (
          <motion.div key={card.label} variants={fadeUp} custom={i} className="glass-card p-5 group hover:shadow-glow/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Overall progress bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" /> Overall Savings Progress
          </h3>
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{overallProgress}%</span>
        </div>
        <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-brand-500 via-cyan-500 to-teal-500 rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse-slow rounded-full" />
          </motion.div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>${totalSaved.toLocaleString()} saved</span>
          <span>${(totalTarget - totalSaved).toLocaleString()} remaining</span>
        </div>
      </motion.div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal, i) => {
          const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
          const isComplete = percentage >= 100;
          const IconComp = goalIcons[goal.icon] || goalIcons.default;
          const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

          return (
            <motion.div
              key={goal.id} variants={fadeUp} initial="hidden" animate="visible" custom={i}
              className={`glass-card p-5 relative overflow-hidden group ${isComplete ? "ring-2 ring-green-500/30" : ""}`}
            >
              {isComplete && (
                <div className="absolute top-3 right-3 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Complete!
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="relative">
                  <CircularProgress percentage={percentage} color={goal.color} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{percentage}%</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${goal.color} flex items-center justify-center text-white`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{goal.name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{goal.category}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${goal.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                        className={`h-full bg-gradient-to-r ${goal.color} rounded-full`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {isComplete ? "Achieved!" : `${daysLeft} days left`}
                    </span>
                    {goal.autoSave > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        ${goal.autoSave}/mo auto
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    {!isComplete && (
                      <button onClick={() => handleAddFunds(goal.id)} className="btn-primary text-xs !px-3 !py-1.5 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add $100
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Savings Goal</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Goal Name</label>
                <input value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} className="input-field" placeholder="e.g., Dream Vacation" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Target Amount ($)</label>
                <input type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} className="input-field" placeholder="5000" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Deadline</label>
                  <input type="date" value={newGoalDeadline} onChange={(e) => setNewGoalDeadline(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Auto-Save $/mo</label>
                  <input type="number" value={newGoalAutoSave} onChange={(e) => setNewGoalAutoSave(e.target.value)} className="input-field" placeholder="100" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(goalIcons).map(([key, Icon]) => (
                    <button
                      key={key}
                      onClick={() => setNewGoalIcon(key)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        newGoalIcon === key
                          ? "bg-brand-500 text-white scale-110"
                          : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleAddGoal} className="btn-primary w-full flex items-center justify-center gap-2">
                <Target className="w-4 h-4" /> Create Goal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavingsGoalsPage;
