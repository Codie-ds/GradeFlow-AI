import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash2, ChevronRight, Brain } from "lucide-react";
import { api } from "../api";
import { PageShell, Card, Button, ErrorAlert, stagger, fadeInUp } from "../components/ui";

const emptyQuestion = () => ({ number: "", text: "", max_marks: "", answer_key: "" });

export default function CreateAssignment() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addQuestion = () => setQuestions((q) => [...q, { ...emptyQuestion(), number: String(q.length + 1) }]);
  const removeQuestion = (i) => setQuestions((q) => q.filter((_, idx) => idx !== i));
  const updateQ = (i, field, value) =>
    setQuestions((q) => q.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  async function submit(e) {
    e.preventDefault();
    setError(null);
    for (const [i, q] of questions.entries()) {
      if (!q.number.trim()) return setError(`Question ${i + 1}: number is required.`);
      if (!q.text.trim()) return setError(`Question ${i + 1}: text is required.`);
      if (!q.max_marks || Number(q.max_marks) <= 0) return setError(`Question ${i + 1}: max marks must be > 0.`);
    }
    setLoading(true);
    try {
      const asgn = await api.createAssignment({
        title,
        description: description || undefined,
        questions: questions.map((q) => ({
          number: q.number,
          text: q.text,
          max_marks: Number(q.max_marks),
          answer_key: q.answer_key || undefined,
        })),
      });
      // Auto-generate rubrics
      await api.generateRubric(asgn.id);
      navigate(`/assignments/${asgn.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
          <Brain className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">New Assignment</h1>
          <p className="text-slate-400 text-sm">AI rubrics are auto-generated after creation.</p>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      <form onSubmit={submit} className="space-y-6 mt-4">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Assignment Title *</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics Test 1 – Waves"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes about the assignment…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Questions</h2>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
            {questions.map((q, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 font-medium">Question {i + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(i)}
                        className="ml-auto text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      required
                      value={q.number}
                      onChange={(e) => updateQ(i, "number", e.target.value)}
                      placeholder="No. (e.g. 1a)"
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                    />
                    <input
                      required
                      type="number"
                      min={1}
                      value={q.max_marks}
                      onChange={(e) => updateQ(i, "max_marks", e.target.value)}
                      placeholder="Max Marks"
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                    />
                    <input
                      value={q.answer_key}
                      onChange={(e) => updateQ(i, "answer_key", e.target.value)}
                      placeholder="Answer key (optional)"
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                    />
                    <textarea
                      required
                      rows={2}
                      value={q.text}
                      onChange={(e) => updateQ(i, "text", e.target.value)}
                      placeholder="Question text…"
                      className="md:col-span-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm resize-none"
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Button type="button" variant="ghost" onClick={addQuestion} className="w-full border-dashed">
            <PlusCircle className="w-4 h-4" /> Add Question
          </Button>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>Cancel</Button>
          <Button type="submit" loading={loading}>
            Create & Generate Rubrics <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
