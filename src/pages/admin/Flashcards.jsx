import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Upload } from "lucide-react";
import { useAdminFlashcards, useCreateAdminFlashcard, useDeleteAdminFlashcard, useUpdateAdminFlashcard } from "../../features/admin/flashcards/hooks";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import client from "../../api/client";
import endpoints from "../../api/endpoints";
import { getErrorMessage } from "../../api/error";

const emptyForm = {
  lessonId: "",
  front: "",
  back: "",
  status: "PUBLISHED",
  displayOrder: 0,
};

export default function AdminFlashcards() {
  const [filters, setFilters] = useState({ status: "PUBLISHED" });
  const [form, setForm] = useState(emptyForm);
  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);
  const { data: flashcards = [], isLoading, isError, refetch } = useAdminFlashcards(filters);
  const { data: coursesData } = useAdminCourses({ page: 1, limit: 200 });
  const createFlashcard = useCreateAdminFlashcard();
  const updateFlashcard = useUpdateAdminFlashcard();
  const deleteFlashcard = useDeleteAdminFlashcard();

  const courses = coursesData?.courses || [];

  const loadUnits = async (cid) => {
    setCourseId(cid);
    setUnitId("");
    setLessons([]);
    setForm((v) => ({ ...v, lessonId: "" }));
    if (!cid) {
      setUnits([]);
      return;
    }
    try {
      const res = await client.get(`${endpoints.admin.courses}/${cid}/units`);
      setUnits(res?.data?.data || res?.data?.data?.units || []);
    } catch {
      try {
        const res = await client.get(`/admin/units`, { params: { courseId: cid } });
        setUnits(res?.data?.data || []);
      } catch {
        setUnits([]);
      }
    }
  };

  const loadLessons = async (uid) => {
    setUnitId(uid);
    setForm((v) => ({ ...v, lessonId: "" }));
    if (!uid) {
      setLessons([]);
      return;
    }
    try {
      const res = await client.get(`/admin/lessons`, { params: { unitId: uid } });
      const payload = res?.data?.data;
      setLessons(payload?.lessons || (Array.isArray(payload) ? payload : []));
    } catch {
      setLessons([]);
    }
  };

  const save = async () => {
    if (!form.lessonId) {
      toast.error("Select a lecture first.");
      return;
    }
    try {
      await createFlashcard.mutateAsync({
        ...form,
        displayOrder: Number(form.displayOrder) || 0,
      });
      setForm((v) => ({ ...emptyForm, lessonId: v.lessonId, status: v.status }));
      toast.success("Flashcard created.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create flashcard."));
    }
  };

  const importCsv = async (file) => {
    if (!form.lessonId) {
      toast.error("Select a lecture before importing.");
      return;
    }
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      toast.error("CSV needs a header and at least one row.");
      return;
    }
    const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const frontIdx = header.findIndex((h) => h === "front");
    const backIdx = header.findIndex((h) => h === "back");
    if (frontIdx < 0 || backIdx < 0) {
      toast.error('CSV must include "front" and "back" columns.');
      return;
    }
    let ok = 0;
    for (const line of lines.slice(1)) {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const front = cols[frontIdx];
      const back = cols[backIdx];
      if (!front || !back) continue;
      try {
        await createFlashcard.mutateAsync({
          lessonId: form.lessonId,
          front,
          back,
          status: form.status,
          displayOrder: 0,
        });
        ok += 1;
      } catch {
        // continue
      }
    }
    toast.success(`Imported ${ok} flashcards.`);
    refetch();
  };

  const updateStatus = async (card, status) => {
    await updateFlashcard.mutateAsync({ id: card.id, body: { status } });
  };

  const lessonOptions = useMemo(() => lessons, [lessons]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Flashcards</h1>
        <p className="mt-1 text-sm text-slate-500">Pick a course → unit → lecture, then create or bulk-import cards.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-3">
          <select value={courseId} onChange={(e) => loadUnits(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
            <option value="">Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <select value={unitId} onChange={(e) => loadLessons(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" disabled={!courseId}>
            <option value="">Unit / System</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.title || u.name}</option>
            ))}
          </select>
          <select
            value={form.lessonId}
            onChange={(e) => setForm((v) => ({ ...v, lessonId: e.target.value }))}
            className="rounded-xl border px-3 py-2 text-sm"
            disabled={!unitId}
          >
            <option value="">Lecture</option>
            {lessonOptions.map((l) => (
              <option key={l.id} value={l.id}>{l.title || l.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm">
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold">
            <Upload className="h-4 w-4" /> Import CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importCsv(f);
                e.target.value = "";
              }}
            />
          </label>
          <textarea value={form.front} onChange={(e) => setForm((v) => ({ ...v, front: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm md:col-span-2" rows={3} placeholder="Front" />
          <textarea value={form.back} onChange={(e) => setForm((v) => ({ ...v, back: e.target.value }))} className="rounded-xl border px-3 py-2 text-sm md:col-span-2" rows={3} placeholder="Back" />
        </div>
        <button type="button" disabled={createFlashcard.isPending} onClick={save} className="mt-3 rounded-xl bg-yu-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          <Plus className="me-1 inline h-4 w-4" /> Create flashcard
        </button>
      </div>

      <div className="flex justify-between gap-3">
        <select value={filters.status} onChange={(e) => setFilters({ status: e.target.value })} className="rounded-xl border px-3 py-2 text-sm">
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button type="button" onClick={() => refetch()} className="rounded-xl border px-3 py-2 text-sm font-semibold">Refresh</button>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {isError ? <p className="text-sm text-red-600">Could not load flashcards.</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {flashcards.length ? (
          flashcards.map((card) => (
            <div key={card.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-0 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{card.front}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{card.back}</p>
                <p className="mt-2 text-xs text-slate-400">{card.lesson?.title ? `${card.lesson.title} · ` : ""}{card.status}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={card.status} onChange={(e) => updateStatus(card, e.target.value)} className="rounded-xl border px-3 py-2 text-xs">
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                <button type="button" onClick={() => deleteFlashcard.mutate(card.id)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">
                  <Trash2 className="me-1 inline h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">No flashcards found.</div>
        )}
      </div>
    </div>
  );
}
