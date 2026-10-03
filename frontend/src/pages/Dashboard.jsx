import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlusCircle, FileText, ChevronRight, Users, Brain } from "lucide-react";
import { api } from "../api";
import { PageShell, Card, Button, EmptyState, ErrorAlert, stagger, fadeInUp } from "../components/ui";

export default function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.listAssignments()
      .then(setAssignments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage assignments and view student grades.</p>
        </div>
        <Button onClick={() => navigate("/new")}>
          <PlusCircle className="w-4 h-4" /> New Assignment
        </Button>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl border border-white/8 p-6 animate-pulse h-36" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No assignments yet"
          body="Create your first assignment and let AI handle the grading."
          action={
            <Button onClick={() => navigate("/new")}>
              <PlusCircle className="w-4 h-4" /> Create Assignment
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {assignments.map((a) => (
            <motion.div key={a.id} variants={fadeInUp}>
              <Link to={`/assignments/${a.id}`}>
                <Card className="hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer h-full">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" />
                  </div>
                  <h3 className="font-semibold text-white text-lg leading-tight mb-1">{a.title}</h3>
                  {a.description && (
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">{a.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {a.questions?.length ?? 0} questions
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageShell>
  );
}
