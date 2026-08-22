import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Crown,
  Infinity,
  Loader2,
  Search,
  UserRound,
  Wallet,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { getErrorMessage } from "../../api/error";
import { useCreateAdminEnrollment } from "../../features/admin/enrollments/hooks";
import { useAdminUsersAll } from "../../features/admin/users/hooks";
import { useAdminCourse, useAdminCourses } from "../../features/admin/courses/hooks";

const MONTH_OPTIONS = Array.from({ length: 36 }, (_, i) => i + 1);

function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function StepPill({ n, label, active, done }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        active
          ? "border-[var(--yu-blue-700)] bg-[var(--yu-blue-700)] text-white"
          : done
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px]">
        {done && !active ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
      </span>
      {label}
    </div>
  );
}

function AccessCard({ active, icon: Icon, title, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-start transition ${
        active
          ? "border-[var(--yu-blue-700)] bg-[var(--yu-blue-700)]/5 shadow-sm ring-2 ring-[var(--yu-blue-700)]/20"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#0F0F13]"
      }`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
          active ? "bg-[var(--yu-blue-700)] text-white" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-black text-slate-900 dark:text-white">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>
    </button>
  );
}

function EnrollStudent() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");

  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [courseQuery, setCourseQuery] = useState("");
  const [accessMode, setAccessMode] = useState("lifetime");
  const [pricingTierId, setPricingTierId] = useState("");
  const [durationMonths, setDurationMonths] = useState(6);
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [renewIfExists, setRenewIfExists] = useState(true);

  const debouncedStudentQuery = useDebouncedValue(studentQuery, 300);

  const createMutation = useCreateAdminEnrollment();
  const { data: usersData, isLoading: studentsLoading, isFetching: studentsFetching } = useAdminUsersAll({
    role: "STUDENT",
    limit: 200,
    search: debouncedStudentQuery.trim() || undefined,
  });
  const { data: coursesData, isLoading: coursesLoading } = useAdminCourses({ page: 1, limit: 200 });
  const { data: selectedCourse, isLoading: courseDetailLoading } = useAdminCourse(courseId || undefined);

  const students = usersData?.users || [];
  const studentTotal = Number(usersData?.meta?.total) || students.length;
  const courses = coursesData?.courses || [];
  const tiers = (selectedCourse?.pricingTiers || []).filter((tier) => tier.isActive !== false);

  const filteredCourses = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => `${c.title || ""} ${c.titleAr || ""}`.toLowerCase().includes(q));
  }, [courses, courseQuery]);

  const filteredStudents = students;

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === studentId) || null,
    [students, studentId]
  );

  useEffect(() => {
    if (!courseId) return;
    setPricingTierId("");
    if (tiers.length && accessMode === "tier") {
      setPricingTierId(tiers[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (accessMode === "tier" && tiers.length && !pricingTierId) {
      setPricingTierId(tiers[0].id);
    }
  }, [accessMode, tiers, pricingTierId]);

  const selectedTier = tiers.find((tier) => tier.id === pricingTierId);

  const previewExpiry = useMemo(() => {
    if (accessMode === "lifetime") return isAr ? "مدى الحياة (بدون انتهاء)" : "Lifetime (no expiry)";
    if (accessMode === "months") {
      const d = new Date();
      d.setDate(d.getDate() + durationMonths * 30);
      return d.toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" });
    }
    if (accessMode === "tier" && selectedTier) {
      const days =
        selectedTier.durationDays ||
        (selectedTier.durationUnit === "MONTH" && selectedTier.durationValue
          ? selectedTier.durationValue * 30
          : selectedTier.durationUnit === "YEAR" && selectedTier.durationValue
            ? selectedTier.durationValue * 365
            : null);
      if (!days) return isAr ? "مدى الحياة (حسب الباقة)" : "Lifetime (per tier)";
      const d = new Date();
      d.setDate(d.getDate() + Number(days));
      return d.toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" });
    }
    return "—";
  }, [accessMode, durationMonths, selectedTier, isAr]);

  const canGoStep2 = Boolean(courseId);
  const canGoStep3 = Boolean(courseId && studentId);
  const canSubmit =
    Boolean(courseId && studentId) &&
    (accessMode !== "months" || durationMonths > 0) &&
    (accessMode !== "tier" || Boolean(pricingTierId));

  const resetWizard = () => {
    createMutation.reset();
    setStep(1);
    setCourseId("");
    setStudentId("");
    setStudentQuery("");
    setCourseQuery("");
    setAccessMode("lifetime");
    setPricingTierId("");
    setDurationMonths(6);
    setAmountPaid("");
    setNotes("");
    setRenewIfExists(true);
  };

  const onSubmit = () => {
    if (!canSubmit) return;
    const amount = amountPaid.trim() === "" ? null : Number(amountPaid);
    if (amount != null && (Number.isNaN(amount) || amount < 0)) {
      toast.error(isAr ? "المبلغ غير صالح" : "Invalid amount");
      return;
    }
    createMutation.mutate(
      {
        studentId,
        courseId,
        accessMode,
        pricingTierId: accessMode === "tier" ? pricingTierId : null,
        durationMonths: accessMode === "months" ? Number(durationMonths) : null,
        amountPaid: amount,
        notes: notes.trim() || null,
        renewIfExists,
      },
      {
        onSuccess: (data) => {
          toast.success(
            data?.renewed
              ? t("adminPages.enrollStudent.renewed", { defaultValue: isAr ? "تم تجديد/تحديث التسجيل بنجاح." : "Enrollment renewed successfully." })
              : t("adminPages.enrollStudent.success")
          );
          resetWizard();
        },
        onError: (e) => {
          toast.error(getErrorMessage(e, t("adminPages.enrollStudent.error", { defaultValue: "Enrollment failed." })));
        },
      }
    );
  };

  const fieldClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[var(--yu-blue-700)] focus:ring-2 focus:ring-[var(--yu-blue-700)]/15 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";

  return (
    <section className="space-y-6 pb-8">
      <PageHeader
        title={t("adminPages.enrollStudent.title")}
        subtitle={t("adminPages.enrollStudent.subtitleRich", {
          defaultValue: isAr
            ? "سجّل طالباً يدوياً مع اختيار الملكية أو المدة أو باقة السعر، وسجّل المبلغ إن وُجد."
            : "Manually enroll a student with lifetime, months, or pricing-tier access — and optionally record payment.",
        })}
      />

      <div className="flex flex-wrap items-center gap-2">
        <StepPill n={1} label={t("adminPages.enrollStudent.stepCourse")} active={step === 1} done={step > 1} />
        <StepPill n={2} label={t("adminPages.enrollStudent.stepStudent")} active={step === 2} done={step > 2} />
        <StepPill
          n={3}
          label={t("adminPages.enrollStudent.stepAccess", { defaultValue: isAr ? "الوصول والدفع" : "Access & payment" })}
          active={step === 3}
          done={false}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[var(--shadow-sm)] dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-white/8">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {step === 1 && (isAr ? "1) اختر الكورس" : "1) Choose course")}
              {step === 2 && (isAr ? "2) اختر الطالب" : "2) Choose student")}
              {step === 3 && (isAr ? "3) نوع الوصول والدفع" : "3) Access type & payment")}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {step === 1 && (isAr ? "ابحث واختر الكورس الذي سيحصل عليه الطالب." : "Search and select the course to grant.")}
              {step === 2 && (isAr ? "ابحث بالطالب بالاسم أو الإيميل." : "Search the student by name or email.")}
              {step === 3 && (isAr ? "حدّد الملكية أو عدد الشهور أو باقة السعر، ثم أكّد." : "Pick lifetime, months, or a pricing tier, then confirm.")}
            </p>
          </div>

          <div className="space-y-5 p-5">
            {step === 1 ? (
              <>
                <label className="relative block">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${fieldClass} ps-9`}
                    value={courseQuery}
                    onChange={(e) => setCourseQuery(e.target.value)}
                    placeholder={isAr ? "ابحث عن كورس…" : "Search courses…"}
                  />
                </label>
                {coursesLoading ? (
                  <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
                ) : (
                  <div className="max-h-[420px] space-y-2 overflow-y-auto pe-1">
                    {filteredCourses.map((c) => {
                      const active = courseId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCourseId(c.id)}
                          className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-start transition ${
                            active
                              ? "border-[var(--yu-blue-700)] bg-[var(--yu-blue-700)]/5"
                              : "border-slate-200 hover:border-slate-300 dark:border-white/10"
                          }`}
                        >
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[var(--yu-blue-700)] dark:bg-white/5">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{c.title}</p>
                            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                              {(c.type || "RECORDED") + (c.price != null ? ` · $${Number(c.price)}` : "")}
                            </p>
                          </div>
                          {active ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[var(--yu-blue-700)]" /> : null}
                        </button>
                      );
                    })}
                    {!filteredCourses.length ? (
                      <p className="py-8 text-center text-sm text-slate-500">{isAr ? "لا توجد كورسات مطابقة." : "No matching courses."}</p>
                    ) : null}
                  </div>
                )}
              </>
            ) : null}

            {step === 2 ? (
              <>
                <label className="relative block">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${fieldClass} ps-9`}
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    placeholder={isAr ? "ابحث عن طالب بالاسم أو الإيميل…" : "Search student by name or email…"}
                  />
                </label>
                <p className="text-xs font-semibold text-slate-500">
                  {studentsLoading || studentsFetching
                    ? t("dashboard.common.loading")
                    : isAr
                      ? `عرض ${filteredStudents.length} من ${studentTotal} طالب`
                      : `Showing ${filteredStudents.length} of ${studentTotal} students`}
                </p>
                {studentsLoading && !students.length ? (
                  <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
                ) : (
                  <div className="max-h-[420px] space-y-2 overflow-y-auto pe-1">
                    {filteredStudents.map((s) => {
                      const active = studentId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStudentId(s.id)}
                          className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-start transition ${
                            active
                              ? "border-[var(--yu-blue-700)] bg-[var(--yu-blue-700)]/5"
                              : "border-slate-200 hover:border-slate-300 dark:border-white/10"
                          }`}
                        >
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[var(--yu-blue-700)] dark:bg-white/5">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{s.fullName || s.name}</p>
                            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{s.email}</p>
                          </div>
                          {active ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[var(--yu-blue-700)]" /> : null}
                        </button>
                      );
                    })}
                    {!filteredStudents.length ? (
                      <p className="py-8 text-center text-sm text-slate-500">{isAr ? "لا يوجد طلاب مطابقون." : "No matching students."}</p>
                    ) : null}
                  </div>
                )}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <AccessCard
                    active={accessMode === "lifetime"}
                    icon={Infinity}
                    title={t("adminPages.enrollStudent.accessLifetime", { defaultValue: isAr ? "ملكية مدى الحياة" : "Lifetime ownership" })}
                    hint={t("adminPages.enrollStudent.accessLifetimeHint", {
                      defaultValue: isAr ? "وصول دائم بدون تاريخ انتهاء." : "Permanent access with no expiry date.",
                    })}
                    onClick={() => setAccessMode("lifetime")}
                  />
                  <AccessCard
                    active={accessMode === "months"}
                    icon={CalendarDays}
                    title={t("adminPages.enrollStudent.accessMonths", { defaultValue: isAr ? "بعدد الشهور" : "By months" })}
                    hint={t("adminPages.enrollStudent.accessMonthsHint", {
                      defaultValue: isAr ? "حدد مدة الوصول بالأشهر." : "Set a fixed number of months.",
                    })}
                    onClick={() => setAccessMode("months")}
                  />
                  <AccessCard
                    active={accessMode === "tier"}
                    icon={Crown}
                    title={t("adminPages.enrollStudent.accessTier", { defaultValue: isAr ? "باقة السعر" : "Pricing tier" })}
                    hint={t("adminPages.enrollStudent.accessTierHint", {
                      defaultValue: isAr ? "استخدم باقة من باقات الكورس." : "Use one of the course pricing tiers.",
                    })}
                    onClick={() => setAccessMode("tier")}
                  />
                </div>

                {accessMode === "months" ? (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t("adminPages.enrollStudent.durationMonths", { defaultValue: isAr ? "عدد الشهور" : "Duration (months)" })}
                    </span>
                    <select className={fieldClass} value={durationMonths} onChange={(e) => setDurationMonths(Number(e.target.value))}>
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m} {isAr ? "شهر" : m === 1 ? "month" : "months"}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {accessMode === "tier" ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t("adminPages.enrollStudent.selectTier", { defaultValue: isAr ? "اختر الباقة" : "Select tier" })}
                    </span>
                    {courseDetailLoading ? (
                      <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
                    ) : tiers.length ? (
                      <div className="space-y-2">
                        {tiers.map((tier) => {
                          const active = pricingTierId === tier.id;
                          const label = isAr ? tier.nameAr || tier.name : tier.name;
                          return (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => setPricingTierId(tier.id)}
                              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                                active
                                  ? "border-[var(--yu-blue-700)] bg-[var(--yu-blue-700)]/5 font-bold"
                                  : "border-slate-200 dark:border-white/10"
                              }`}
                            >
                              <span>{label}</span>
                              <span className="tabular-nums text-slate-700 dark:text-slate-200">${Number(tier.price || 0)}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10">
                        {isAr
                          ? "لا توجد باقات أسعار لهذا الكورس. استخدم الملكية أو عدد الشهور."
                          : "No pricing tiers on this course. Use lifetime or months instead."}
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t("adminPages.enrollStudent.amountOptional")}
                    </span>
                    <div className="relative">
                      <Wallet className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${fieldClass} ps-9`}
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </label>
                  <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <input type="checkbox" checked={renewIfExists} onChange={(e) => setRenewIfExists(e.target.checked)} />
                    {t("adminPages.enrollStudent.renewIfExists", {
                      defaultValue: isAr ? "تجديد/تحديث إذا كان مسجلاً مسبقاً" : "Renew/update if already enrolled",
                    })}
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("adminPages.enrollStudent.notes")}
                  </span>
                  <textarea
                    className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--yu-blue-700)] focus:ring-2 focus:ring-[var(--yu-blue-700)]/15 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isAr ? "ملاحظات داخلية (اختياري)…" : "Internal notes (optional)…"}
                  />
                </label>
              </>
            ) : null}

            {createMutation.isError ? (
              <p className="text-sm text-red-600 dark:text-red-300">
                {getErrorMessage(createMutation.error, "Failed to enroll student.")}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/8">
              <button
                type="button"
                onClick={resetWizard}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200"
              >
                {t("adminPages.enrollStudent.reset")}
              </button>
              <div className="flex flex-wrap gap-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold dark:border-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                    {isAr ? "رجوع" : "Back"}
                  </button>
                ) : null}
                {step < 3 ? (
                  <button
                    type="button"
                    disabled={(step === 1 && !canGoStep2) || (step === 2 && !canGoStep3)}
                    onClick={() => setStep((s) => s + 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {isAr ? "التالي" : "Next"}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canSubmit || createMutation.isPending}
                    onClick={onSubmit}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {createMutation.isPending
                      ? t("dashboard.common.loading", { defaultValue: "Submitting…" })
                      : t("adminPages.enrollStudent.submit")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(160deg,#0A1628_0%,#153577_55%,#1B4FBF_100%)] p-5 text-white shadow-[var(--shadow-brand)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100/80">
              {isAr ? "ملخص التسجيل" : "Enrollment summary"}
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-blue-100/70">{isAr ? "الكورس" : "Course"}</p>
                <p className="font-bold">{selectedCourse?.title || courses.find((c) => c.id === courseId)?.title || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-blue-100/70">{isAr ? "الطالب" : "Student"}</p>
                <p className="font-bold">{selectedStudent?.fullName || selectedStudent?.name || "—"}</p>
                <p className="text-xs text-blue-100/70">{selectedStudent?.email || ""}</p>
              </div>
              <div>
                <p className="text-xs text-blue-100/70">{isAr ? "نوع الوصول" : "Access"}</p>
                <p className="font-bold">
                  {accessMode === "lifetime" && (isAr ? "ملكية مدى الحياة" : "Lifetime")}
                  {accessMode === "months" && `${durationMonths} ${isAr ? "شهر" : "months"}`}
                  {accessMode === "tier" &&
                    (selectedTier
                      ? isAr
                        ? selectedTier.nameAr || selectedTier.name
                        : selectedTier.name
                      : "—")}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-100/70">{isAr ? "ينتهي في" : "Expires"}</p>
                <p className="font-bold">{previewExpiry}</p>
              </div>
              <div>
                <p className="text-xs text-blue-100/70">{isAr ? "المبلغ المسجّل" : "Recorded amount"}</p>
                <p className="font-bold tabular-nums">{amountPaid.trim() ? `$${Number(amountPaid || 0)}` : isAr ? "بدون دفعة" : "No payment"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-slate-200/80 bg-white p-5 text-sm dark:border-white/8 dark:bg-[#1A1A22]">
            <p className="font-bold text-slate-900 dark:text-white">{isAr ? "نصائح سريعة" : "Quick tips"}</p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-500">
              <li>{isAr ? "• الملكية = وصول دائم بدون انتهاء." : "• Lifetime = permanent access."}</li>
              <li>{isAr ? "• عدد الشهور مناسب للهدايا أو الاشتراكات المؤقتة." : "• Months works well for gifts or temporary access."}</li>
              <li>{isAr ? "• باقة السعر تستخدم مدة وسعر الباقة المعرّفة في الكورس." : "• Pricing tier uses the course tier duration and price."}</li>
              <li>{isAr ? "• المبلغ اختياري ويُسجَّل كدفعة يدوية مدفوعة." : "• Amount is optional and creates a paid manual payment."}</li>
            </ul>
            <Link to="/admin/enrollments" className="mt-4 inline-flex text-xs font-bold text-[var(--yu-blue-700)] hover:underline">
              {isAr ? "عرض كل التسجيلات" : "View all enrollments"}
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default EnrollStudent;
