import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Users, ChevronLeft, Sparkles, FileUp, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "../api";
import { PageShell, Card, Button, StatusBadge, EmptyState, ErrorAlert, ScoreBar, stagger, fadeInUp } from "../components/ui";

// ── Upload Form ───────────────────────────────────────────────────────────────
function UploadForm({ assignmentId, onSuccess }) {
  const [studentName, setStudentName] = useState("");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file.");
    if (!studentName.trim()) return setError("Student name is required.");
    setLoading(true);
    setError(null);
    try {
      const sub = await api.uploadSubmission(assignmentId, studentName.trim(), file);
      onSuccess(sub);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <input
        required
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        placeholder="Student name"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
      />

      {/* Drop zone */}
      <label
        className={`flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
          dragging ? "border-blue-500 bg-blue-500/10" : "border-white/15 hover:border-white/30 hover:bg-white/5"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setFile(f); else setError("Only PDFs are accepted."); }}
      >
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        ) : (
          <div className="text-center">
            <FileUp className="w-7 h-7 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Drop PDF here or click to browse</p>
            <p className="text-xs text-slate-600 mt-1">Max 10 MB</p>
          </div>
        )}
      </label>

      <Button type="submit" loading={loading} className="w-full">
        <Upload className="w-4 h-4" /> Upload & Start Grading
      </Button>
    </form>
  );
}

// ── Grading Live Indicator ────────────────────────────────────────────────────
function GradingIndicator({ submissionId, onDone }) {
  const [sub, setSub] = useState(null);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const s = await api.getSubmission(submissionId);
        setSub(s);
        if (s.status === "graded" || s.status === "failed") {
          clearInterval(poll);
          onDone(s);
        }
      } catch (_) {}
    }, 2000);
    return () => clearInterval(poll);
  }, [submissionId]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 py-10 text-center"
    >
      {/* Pulsing brain rings */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-blue-500/10 animate-ping [animation-delay:0.3s]" />
        <div className="relative w-full h-full rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
      </div>
      <div>
        <p className="text-white font-semibold text-lg">Gemma 4 is grading…</p>
        <p className="text-slate-400 text-sm mt-1">OCR → AI evaluation → saving results</p>
      </div>
      {sub && <StatusBadge status={sub.status} />}
    </motion.div>
  );
}

// ── Submission Row ────────────────────────────────────────────────────────────
function SubmissionRow({ sub, assignmentId }) {
  const nav = useNavigate();
  const result = sub.result;
  return (
    <motion.div variants={fadeInUp}>
      <Card
        className="hover:border-white/20 cursor-pointer transition-all hover:-translate-y-0.5"
        onClick={() => nav(`/assignments/${assignmentId}/submissions/${sub.id}`)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{sub.student_name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{new Date(sub.created_at).toLocaleString()}</p>
          </div>
          <StatusBadge status={sub.status} />
          {result && (
            <span className="font-mono text-sm font-bold text-white">
              {result.total_marks} <span className="text-slate-500">/ {result.max_total}</span>
            </span>
          )}
        </div>
        {result && (
          <div className="mt-3">
            <ScoreBar awarded={result.total_marks} max={result.max_total} />
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// ── Main Assignment Page ──────────────────────────────────────────────────────
export default function AssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradingId, setGradingId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      api.getAssignment(id),
      api.listSubmissions(id),
    ])
      .then(([asgn, subs]) => { setAssignment(asgn); setSubmissions(subs); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function handleUploadSuccess(sub) {
    setShowUpload(false);
    setGradingId(sub.id);
  }

  function handleGradingDone(sub) {
    setGradingId(null);
    setSubmissions((prev) => {
      const exists = prev.find((s) => s.id === sub.id);
      return exists ? prev.map((s) => (s.id === sub.id ? sub : s)) : [sub, ...prev];
    });
  }

  if (loading) return (
    <PageShell>
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    </PageShell>
  );

  return (
    <PageShell>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-slate-500 text-sm">Dashboard</span>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {/* Assignment Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{assignment?.title}</h1>
        {assignment?.description && <p className="text-slate-400 mt-1">{assignment.description}</p>}
        <div className="flex gap-3 mt-4">
          <span className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-slate-400">
            {assignment?.questions?.length ?? 0} questions
          </span>
          <span className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-slate-400">
            {assignment?.questions?.reduce((s, q) => s + q.max_marks, 0) ?? 0} total marks
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Questions / Upload */}
        <div className="space-y-4">
          <h2 className="font-semibold text-white">Questions</h2>
          {assignment?.questions?.map((q) => (
            <Card key={q.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 text-xs font-mono font-bold">Q{q.number}</span>
                <span className="text-xs text-slate-500">{q.max_marks} marks</span>
              </div>
              <p className="text-sm text-slate-300">{q.text}</p>
              {q.rubric?.criteria && (
                <div className="pt-2 border-t border-white/5 space-y-1">
                  {q.rubric.criteria.map((c, ci) => (
                    <p key={ci} className="text-xs text-slate-500">
                      <span className="text-slate-400">· </span>{c.name} ({c.max_marks}m)
                    </p>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {/* Upload toggle */}
          {!gradingId && (
            <div>
              <Button
                variant={showUpload ? "ghost" : "primary"}
                className="w-full"
                onClick={() => setShowUpload((v) => !v)}
              >
                <Upload className="w-4 h-4" />
                {showUpload ? "Cancel" : "Upload Student PDF"}
              </Button>
              {showUpload && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Card>
                    <UploadForm assignmentId={id} onSuccess={handleUploadSuccess} />
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Right: Submissions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" /> Submissions
            </h2>
            <span className="text-xs text-slate-500">{submissions.length} total</span>
          </div>

          {/* Live grading indicator */}
          {gradingId && (
            <Card>
              <GradingIndicator submissionId={gradingId} onDone={handleGradingDone} />
            </Card>
          )}

          {submissions.length === 0 && !gradingId ? (
            <EmptyState
              icon={Users}
              title="No submissions yet"
              body="Upload a student PDF to begin grading."
            />
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
              {submissions.map((s) => (
                <SubmissionRow key={s.id} sub={s} assignmentId={id} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
