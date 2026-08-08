import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import PermissionGate from "../../components/ui/PermissionGate";
import client from "../../api/client";
import endpoints from "../../api/endpoints";
import { getErrorMessage } from "../../api/error";

export default function AdminReviews() {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await client.get(endpoints.admin.reviews);
      const payload = res?.data?.data;
      setReviews(payload?.reviews || (Array.isArray(payload) ? payload : []));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load reviews"));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setVisibility = async (id, isVisible) => {
    try {
      await client.patch(`${endpoints.admin.reviews}/${id}`, { isVisible, isPublished: isVisible });
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update review"));
    }
  };

  return (
    <PermissionGate
      permission="course:manage"
      fallback={<p className="text-sm text-slate-500">{isRtl ? "ليس لديك صلاحية" : "You do not have access."}</p>}
    >
      <section className="space-y-6">
        <PageHeader
          title={isRtl ? "التقييمات" : "Reviews"}
          subtitle={isRtl ? "إشراف على تقييمات الطلاب" : "Moderate student course reviews"}
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <ul className="space-y-2">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#1A1A22]"
            >
              <div className="min-w-0">
                <p className="font-semibold">{r.course?.title || r.courseId}</p>
                <p className="text-slate-600 dark:text-slate-300">{r.comment || r.content || "—"}</p>
                <p className="text-xs text-slate-400">
                  {r.user?.fullName || r.user?.email || r.userId} · ★ {r.rating}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVisibility(r.id, !(r.isVisible ?? r.isPublished))}
                className="rounded-lg border px-3 py-1.5 text-xs font-bold dark:border-white/10"
              >
                {(r.isVisible ?? r.isPublished) ? (isRtl ? "إخفاء" : "Hide") : isRtl ? "إظهار" : "Show"}
              </button>
            </li>
          ))}
          {!reviews.length ? (
            <li className="rounded-lg border border-dashed px-4 py-8 text-center text-slate-500 dark:border-white/10">
              {isRtl ? "لا توجد تقييمات" : "No reviews"}
            </li>
          ) : null}
        </ul>
      </section>
    </PermissionGate>
  );
}
