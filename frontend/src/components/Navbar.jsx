import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, PlusCircle, LayoutDashboard } from "lucide-react";
import { useScroll, useSpring } from "framer-motion";

export default function Navbar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const { pathname } = useLocation();

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/new", label: "New Assignment", icon: PlusCircle },
  ];

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 origin-left z-50 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        style={{ scaleX }}
      />

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 px-6 py-4"
        style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">GradeFlow <span className="text-blue-400">AI</span></span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === to
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
