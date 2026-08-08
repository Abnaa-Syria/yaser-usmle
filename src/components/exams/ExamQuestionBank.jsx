import { Loader2, Plus, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import ExamQuestionEditorCard from "./ExamQuestionEditorCard";
import { defaultNewQuestion } from "./examQuestionUtils";

function PointsBar({ questions, totalPoints, label }) {
  const used = (questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  const pct = totalPoints ? Math.min(100, Math.round((used / totalPoints) * 100)) : 0;
  const ok = used === totalPoints;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#12121a]/50">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label("pointsAllocated", "Points allocated")}</span>
        <span className={`font-bold ${ok ? "text-emerald-600" : used > totalPoints ? "text-red-500" : "text-[var(--yu-blue-700)]"}`}>
          {used} / {totalPoints ?? "—"}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${ok ? "bg-emerald-500" : used > totalPoints ? "bg-red-500" : "bg-[var(--yu-blue-700)]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function rowsToQuestions(rows, startOrder) {
  if (!rows.length) return [];
  const header = rows[0].map(normalizeHeader);
  const idx = (name) => header.indexOf(name);
  const out = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cols = rows[i].map((c) => String(c ?? "").trim());
    if (!cols.some(Boolean)) continue;
    const type = (cols[idx("type")] || "MULTIPLE_CHOICE").toUpperCase();
    const optionsRaw = cols[idx("options")] || "";
    const options = optionsRaw
      ? optionsRaw.split("|").map((o) => o.trim()).filter(Boolean)
      : ["", "", "", ""];
    out.push({
      questionText: cols[idx("text")] || cols[idx("questiontext")] || "Imported question",
      type: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"].includes(type) ? type : "MULTIPLE_CHOICE",
      points: Number(cols[idx("points")] || 1),
      order: startOrder + out.length,
      options,
      correctAnswer: cols[idx("correctanswer")] || options[0] || "",
      explanation: cols[idx("explanation")] || "",
      imageUrl: cols[idx("imageurl")] || "",
    });
  }
  return out;
}

async function parseImportFile(file) {
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  }
  const text = await file.text();
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => line.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
}

export function ExamQuestionBank({
  exam,
  isLoading,
  onAddQuestion,
  onSaveQuestion,
  onDeleteQuestion,
  isAdding,
  savingId,
  deletingId,
  compact = false,
  showGrip = false,
  headerExtra,
}) {
  const { t } = useTranslation();
  const label = (key, fallback, opts) => t(`examQuestionEditor.${key}`, { defaultValue: fallback, ...opts });
  const questions = exam?.questions || [];

  const handleAdd = () => {
    onAddQuestion(
      defaultNewQuestion(
        questions.length + 1,
        label("newQuestionDraft", "Write your question here...")
      )
    );
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onAddQuestion) return;
    try {
      const rows = await parseImportFile(file);
      const imported = rowsToQuestions(rows, questions.length + 1);
      if (!imported.length) {
        toast.error(label("importEmpty", "No rows found to import"));
        return;
      }
      for (const q of imported) {
        await onAddQuestion(q);
      }
      toast.success(label("importSuccess", "Imported {{count}} questions", { count: imported.length }));
    } catch (err) {
      toast.error(err?.message || label("importFailed", "Import failed"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--yu-blue-700)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {label("bankTitle", "Question bank")}
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {label("questionsCount", "{{count}} questions", { count: questions.length })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--yu-blue-600)] disabled:opacity-60"
          >
            {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {label("addQuestion", "Add question")}
          </button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
            {label("importCsvXlsx", "Import CSV/XLSX")}
            <input
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={handleImport}
            />
          </label>
        </div>
      </div>

      {exam?.totalPoints != null ? <PointsBar questions={questions} totalPoints={exam.totalPoints} label={label} /> : null}

      {headerExtra}

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center dark:border-white/10">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label("emptyTitle", "No questions yet")}</p>
          <p className="mt-1 text-xs text-slate-400">{label("emptyHint", "Click “Add question” to start building your exam.")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <ExamQuestionEditorCard
              key={q.id}
              question={q}
              index={i}
              onSave={onSaveQuestion}
              onDelete={onDeleteQuestion}
              isSaving={savingId === q.id}
              isDeleting={deletingId === q.id}
              compact={compact}
              showGrip={showGrip}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ExamQuestionBankDrawer({
  exam,
  examId,
  isLoading,
  onClose,
  onAddQuestion,
  onSaveQuestion,
  onDeleteQuestion,
  isAdding,
  savingId,
  deletingId,
}) {
  const { t, i18n } = useTranslation();
  const label = (key, fallback) => t(`examQuestionEditor.${key}`, { defaultValue: fallback });
  const isRtl = i18n.dir() === "rtl";

  if (!examId) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 z-[210] flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-[#1A1A22] ${
          isRtl ? "left-0 border-r border-slate-200 dark:border-white/10" : "right-0 border-l border-slate-200 dark:border-white/10"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/5">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {exam?.title || t("dashboard.common.loading")}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {label("drawerSubtitle", "Question bank editor")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ExamQuestionBank
            exam={exam}
            isLoading={isLoading}
            onAddQuestion={onAddQuestion}
            onSaveQuestion={onSaveQuestion}
            onDeleteQuestion={onDeleteQuestion}
            isAdding={isAdding}
            savingId={savingId}
            deletingId={deletingId}
            compact
          />
        </div>
      </div>
    </>,
    document.body
  );
}
