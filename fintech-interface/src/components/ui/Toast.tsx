/**
 * Toast notification system.
 *
 * Usage:
 *   import { ToastProvider, useToast } from "./Toast";
 *   // wrap your tree in <ToastProvider>
 *   const { toast } = useToast();
 *   toast({ type: "error", message: "Insufficient balance" });
 */
import React, { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

/* ── Types ── */
type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}
interface ToastContextValue {
  toast: (opts: Omit<ToastItem, "id">) => void;
}

const ToastCtx = createContext<ToastContextValue | undefined>(undefined);
let nextId = 0;

/* ── Icon + colour lookup ── */
const STYLE: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-300",
    icon: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
  },
  error: {
    bg: "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300",
    icon: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-300",
    icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  },
};

/* ── Provider ── */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { ...opts, id }]);
    // auto-dismiss after 5 s
    setTimeout(() => remove(id), 5000);
  }, [remove]);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}

      {/* Render toasts top-right, stacked */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const s = STYLE[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-start gap-3 border rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm ${s.bg}`}
              >
                {s.icon}
                <p className="text-sm font-medium flex-1 pt-0.5">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
};

/* ── Hook ── */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
