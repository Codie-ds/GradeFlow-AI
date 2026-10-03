import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft, CheckCircle2, AlertTriangle, XCircle,
  MessageSquare, Eye, Loader2
} from "lucide-react";
import { api } from "../api";
import { PageShell, Card, Button, StatusBadge, ScoreBar, ErrorAlert, stagger, fadeInUp, cn } from "../components/ui";

function CriterionCard({ c, questionMax }) {
  const pct = c.max > 0 ? (c.awarded / c.max) * 100 : 0;
  const statusIcon = pct >= 75
    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    : pct >= 35
    ? <AlertTriangle className="w-4 h-4 text-amber-400" />
    : <XCircle className="w-4 h-4 text-rose-400" />;

  return (
    <motion.div variants={fadeInUp}>
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="font-semibold text-white text-sm">{c.name}</span>
          <span className="ml-auto font-mono text-sm font-bold text-white">
            {c.awarded} <span className="text-slate-500">/ {c.max}</span>
          </span>
        </div>
        <ScoreBar awarded={c.awarded} max={c.max} />
        {c.reason && (
          <p className="text-sm text-slate-400 leading-relaxed">{c.reason}</p>
        )}
        {c.evidence && (
          <div className="bg-white/5 rounded-lg px-3 py-2 border-l-2 border-blue-500/50">
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Evidence
            </p>
            <p className="text-sm text-slate-300 italic">&ldquo;{c.evidence}&rdquo;</p>
          </div>
        )}
        {c.confidence !== undefined && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Confidence:</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  c.confidence >= 0.7 ? "bg-emerald-400/60" : "bg-amber-400/60"
                )}
                style={{ width: `${(c.confidence * 100).toFixed(0)}%` }}
              />
            </div>
            <span>{(c.confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function QuestionResult({ qnum, data }) {
  if (data.error) {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5">
        <p className="text-rose-400 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" /> Grading failed for Q{qnum}: {data.error}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
          Q{qnum}
        </span>
        <div className="flex-1">
          <ScoreBar awarded={data.question_total} max={data.question_max} />
        </div>
        <span className="font-mono text-sm font-bold text-white ml-2">
          {data.question_total} / {data.question_max}
        </span>
      </div>

      {data.student_answer && (
        <Card className="bg-white/3 border-white/5 py-3 px-4">
          <p className="text-xs text-slate-500 mb-1">Student answered:</p>
          <p className="text-sm text-slate-300 italic">{data.student_answer}</p>
        </Card>
      )}

      {data.answer_found === false && (
        <p className="text-xs text-amber-400 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> No answer found for this question in the submission.
        </p>
      )}

      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3 pl-2">
        {(data.criteria || []).map((c, i) => (
          <CriterionCard key={i} c={c} questionMax={data.question_max} />
        ))}
      </motion.div>

      {data.feedback && (
        <Card className="bg-blue-500/5 border-blue-500/20 flex gap-3">
          <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-300 leading-relaxed">{data.feedback}</p>
        </Card>
      )}
    </div>
  );
}

export default function ResultPage() {
  const { assignmentId, submissionId } = useParams();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getSubmission(submissionId)
      .then(setSub)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) return (
    <PageShell>
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    </PageShell>
  );

  const result = sub?.result;

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={() => navigate("/dashboard")} className="text-slate-500 hover:text-white transition-colors">Dashboard</button>
        <span className="text-slate-600">/</span>
        <button onClick={() => navigate(`/assignments/${assignmentId}`)} className="text-slate-500 hover:text-white transition-colors">Assignment</button>
        <span className="text-slate-600">/</span>
        <span className="text-white">Result</span>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Student Header Card */}
      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1">Student</p>
            <h1 className="text-2xl font-bold text-white">{sub?.student_name}</h1>
            {sub?.created_at && (
              <p className="text-xs text-slate-500 mt-1">Submitted {new Date(sub.created_at).toLocaleString()}</p>
            )}
          </div>
          <StatusBadge status={sub?.status} />
          {result && (
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Total Score</p>
              <p className="text-4xl font-extrabold text-white font-mono">
                {result.total_marks}
                <span className="text-xl text-slate-500 ml-1">/ {result.max_total}</span>
              </p>
              <div className="mt-2 w-40">
                <ScoreBar awarded={result.total_marks} max={result.max_total} />
              </div>
            </div>
          )}
        </div>
        {result?.needs_review && (
          <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 border border-amber-500/30 rounded-xl px-4 py-2.5">
            <AlertTriangle className="w-4 h-4" />
            This submission has low-confidence grades. Manual review recommended.
          </div>
        )}
      </Card>

      {/* No result yet */}
      {!result && sub?.status !== "failed" && (
        <Card className="text-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white font-semibold">Grading in progress…</p>
          <p className="text-slate-400 text-sm mt-1">Check back in a few seconds.</p>
        </Card>
      )}

      {sub?.error && (
        <Card className="border-rose-500/30 bg-rose-500/5 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-400 mt-0.5" />
          <div>
            <p className="text-rose-400 font-semibold">Grading Failed</p>
            <p className="text-rose-300/70 text-sm mt-1">{sub.error}</p>
          </div>
        </Card>
      )}

      {/* Per-question results */}
      {result?.evaluation && (
        <div className="space-y-10">
          {Object.entries(result.evaluation).map(([qnum, data]) => (
            <div key={qnum}>
              <QuestionResult qnum={qnum} data={data} />
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
