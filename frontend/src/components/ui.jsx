import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, Clock, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Animation Variants ────────────────────────────────────────────────────────
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const statusMeta = {
  uploaded:   { label: "Queued",     icon: Clock,       color: "text-slate-400 border-slate-500/40 bg-slate-500/10" },
  processing: { label: "Grading…",  icon: Loader2,     color: "text-amber-400 border-amber-500/40 bg-amber-500/10", spin: true },
  graded:     { label: "Graded",     icon: CheckCircle2, color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  failed:     { label: "Failed",     icon: XCircle,     color: "text-rose-400 border-rose-500/40 bg-rose-500/10" },
};

export function StatusBadge({ status }) {
  const m = statusMeta[status] || statusMeta.uploaded;
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", m.color)}>
      <Icon className={cn("w-3.5 h-3.5", m.spin && "animate-spin")} />
      {m.label}
    </span>
  );
}

// ── Glass Card ────────────────────────────────────────────────────────────────
export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl border border-white/8 p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = "primary", loading, disabled, className, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  const variants = {
    primary:  "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:    "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-white/20",
    danger:   "bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30",
  };
  return (
    <button className={cn(base, variants[variant], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// ── Score Bar ─────────────────────────────────────────────────────────────────
export function ScoreBar({ awarded, max, label }) {
  const pct = max > 0 ? Math.min(100, (awarded / max) * 100) : 0;
  const color = pct >= 75 ? "bg-emerald-400" : pct >= 45 ? "bg-amber-400" : "bg-rose-400";
  const glow  = pct >= 75 ? "shadow-[0_0_8px_rgba(52,211,153,0.6)]" : pct >= 45 ? "shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "shadow-[0_0_8px_rgba(248,113,113,0.5)]";
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span className="font-mono font-semibold text-white">{awarded} / {max}</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color, glow)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// ── Page Shell ────────────────────────────────────────────────────────────────
export function PageShell({ children }) {
  return (
    <motion.div
      className="min-h-screen py-28 px-4 max-w-5xl mx-auto"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeInUp}
    >
      {children}
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = Brain, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <div>
        <p className="text-white font-semibold text-lg">{title}</p>
        {body && <p className="text-slate-400 text-sm mt-1">{body}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Error Alert ───────────────────────────────────────────────────────────────
export function ErrorAlert({ message, onDismiss }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{message}</span>
          {onDismiss && (
            <button onClick={onDismiss} className="flex-shrink-0 hover:text-rose-300 transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
