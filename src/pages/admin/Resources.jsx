import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PageHeader from "../../components/ui/PageHeader";
import PermissionGate from "../../components/ui/PermissionGate";
import client from "../../api/client";
import endpoints from "../../api/endpoints";
import { getErrorMessage } from "../../api/error";
import { useAdminCourses } from "../../features/admin/courses/hooks";

export default function AdminResources() {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data: coursesData } = useAdminCourses({ page: 1, limit: 200 });
  const courses = coursesData?.courses || [];

  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUnits = async (cid) => {
    setCourseId(cid);
    setUnitId("");
    setLessonId("");
    setLessons([]);
    setItems([]);
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
    setLessonId("");
    setItems([]);
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

  const load = async (lid = lessonId) => {
    setMessage("");
    if (!lid) return;
    setLoading(true);
    try {
      const res = await client.get(`/admin/lessons/${lid}/resources`);
      setItems(res?.data?.data || []);
    } catch (err) {
      try {
        const res = await client.get(endpoints.admin.resources, { params: { lessonId: lid } });
        setItems(res?.data?.data || []);
      } catch (e2) {
        setMessage(getErrorMessage(e2, "Failed to load resources"));
      }
    } finally {
      setLoading(false);
    }
  };

  const onSelectLesson = async (lid) => {
    setLessonId(lid);
    if (lid) await load(lid);
    else setItems([]);
  };

  const create = async () => {
    if (!lessonId) {
      toast.error(isRtl ? "اختر محاضرة أولاً" : "Select a lecture first");
      return;
    }
    if (!title.trim() || !url.trim()) {
      toast.error(isRtl ? "العنوان والرابط مطلوبان" : "Title and URL are required");
      return;
    }
    try {
      await client.post(`/admin/lessons/${lessonId}/resources`, { title, url, type: "FILE" });
      setTitle("");
      setUrl("");
      toast.success(isRtl ? "تمت الإضافة" : "Resource added");
      await load();
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to create resource"));
    }
  };

  const remove = async (id) => {
    if (!window.confirm(isRtl ? "حذف هذا المورد؟" : "Delete this resource?")) return;
    try {
      await client.delete(`/admin/resources/${id}`);
      await load();
    } catch (err) {
      try {
        await client.delete(`/admin/lessons/${lessonId}/resources/${id}`);
        await load();
      } catch (e2) {
        toast.error(getErrorMessage(e2, "Failed to delete"));
      }
    }
  };

  return (
    <PermissionGate
      permission="course:manage"
      fallback={<p className="text-sm text-slate-500">{isRtl ? "ليس لديك صلاحية" : "You do not have access."}</p>}
    >
      <section className="space-y-6">
        <PageHeader
          title={isRtl ? "موارد الدروس" : "Lesson Resources"}
          subtitle={isRtl ? "إدارة ملفات ومرفقات المحاضرات" : "Manage lecture attachments"}
        />

        <div className="grid gap-2 rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-[#1A1A22] md:grid-cols-3">
          <select
            className="h-10 rounded-lg border px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            value={courseId}
            onChange={(e) => loadUnits(e.target.value)}
          >
            <option value="">{isRtl ? "اختر كورس" : "Select course"}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            value={unitId}
            onChange={(e) => loadLessons(e.target.value)}
            disabled={!courseId}
          >
            <option value="">{isRtl ? "اختر وحدة" : "Select unit"}</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.title || u.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            value={lessonId}
            onChange={(e) => onSelectLesson(e.target.value)}
            disabled={!unitId}
          >
            <option value="">{isRtl ? "اختر محاضرة" : "Select lecture"}</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title || l.name}
              </option>
            ))}
          </select>
        </div>

        {message ? <p className="text-sm text-red-500">{message}</p> : null}

        <div className="grid gap-2 rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-[#1A1A22] md:grid-cols-3">
          <input
            className="h-10 rounded-lg border px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13]"
            placeholder={isRtl ? "العنوان" : "Title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="h-10 rounded-lg border px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13]"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="button" onClick={create} className="rounded-lg border px-3 text-sm font-semibold dark:border-white/10">
            {isRtl ? "إضافة مورد" : "Add resource"}
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-500">{isRtl ? "جاري التحميل..." : "Loading..."}</p> : null}

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#1A1A22]"
            >
              <div className="min-w-0">
                <p className="font-semibold">{item.title || item.name}</p>
                <a
                  className="truncate text-[var(--yu-blue-700)] underline"
                  href={item.url || item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.url || item.fileUrl}
                </a>
              </div>
              <button type="button" onClick={() => remove(item.id)} className="text-xs font-semibold text-red-600 hover:underline">
                {isRtl ? "حذف" : "Delete"}
              </button>
            </li>
          ))}
          {!loading && lessonId && !items.length ? (
            <li className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-slate-500 dark:border-white/10">
              {isRtl ? "لا توجد موارد لهذه المحاضرة" : "No resources for this lecture"}
            </li>
          ) : null}
        </ul>
      </section>
    </PermissionGate>
  );
}
