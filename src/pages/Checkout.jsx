import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import PageHeader from "../components/dashboard/PageHeader";
import EmptyState from "../components/dashboard/EmptyState";
import {
  StudentSurface,
  studentBtnGhost,
  studentBtnPrimary,
  studentFieldClass,
  studentSelectClass,
} from "../components/student/ui";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { usePublicCourse, usePublicPackage } from "../features/public/hooks";
import { getErrorMessage } from "../api/error";
import { postStudentCourseCheckout, postStudentPackageCheckout, validateStudentCoupon, uploadPaymentProof } from "../features/student/financials/api";
import { applyCouponDiscount, couponDiscountLabel } from "../features/student/financials/coupon";

function formatPrice(price) {
  const value = Math.round(Number(price) || 0);
  return `${value} USD`;
}

/** Accept absolute http(s) URLs or uploaded proof paths from our API. */
function isValidReceiptUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/uploads/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  const courseId = (searchParams.get("courseId") || "").trim();
  const packageId = (searchParams.get("packageId") || "").trim();
  const pricingTierId = (searchParams.get("pricingTierId") || "").trim();

  const [localError, setLocalError] = useState("");
  const [flow, setFlow] = useState("form");
  const [orderMeta, setOrderMeta] = useState({ reusedPending: false });
  const [submitting, setSubmitting] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [studentNote, setStudentNote] = useState("");

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    isFetched: courseFetched,
  } = usePublicCourse(courseId || undefined);
  const {
    data: coursePackage,
    isLoading: packageLoading,
    isError: packageError,
    isFetched: packageFetched,
  } = usePublicPackage(packageId || undefined);

  useEffect(() => {
    if (courseId || packageId) {
      setFlow("form");
      setOrderMeta({ reusedPending: false });
      setLocalError("");
      setCouponCode("");
      setCouponMessage("");
      setAppliedCoupon(null);
    }
  }, [courseId, packageId]);

  const selectedTier = useMemo(() => {
    const tiers = courseId ? course?.pricingTiers : coursePackage?.pricingTiers;
    if (!pricingTierId || !tiers) return null;
    return tiers.find((t) => t.id === pricingTierId);
  }, [course, courseId, coursePackage, pricingTierId]);

  const courseAmount = useMemo(() => {
    if (selectedTier) return Number(selectedTier.price);
    if (packageId) return Number(coursePackage?.price || 0);
    if (!course?.isLifetimePurchasable) return 0;
    return Number(course.price);
  }, [course, coursePackage, packageId, selectedTier]);

  const finalAmount = useMemo(() => {
    if (!courseAmount) return 0;
    return appliedCoupon ? applyCouponDiscount(courseAmount, appliedCoupon) : courseAmount;
  }, [courseAmount, appliedCoupon]);

  const discountAmount = useMemo(() => Math.max(0, courseAmount - finalAmount), [courseAmount, finalAmount]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuth) {
    const dest = `/checkout?${searchParams.toString()}`.replace(/\?$/, "");
    const loginTo = searchParams.toString() ? `/login?redirect=${encodeURIComponent(dest)}` : "/login";
    return <Navigate to={loginTo} replace />;
  }

  if (role === APP_ROLES.ADMIN) return <Navigate to="/admin" replace />;
  if (role === APP_ROLES.INSTRUCTOR) return <Navigate to="/instructor" replace />;
  if (role !== APP_ROLES.STUDENT) return <Navigate to="/" replace />;

  if (!courseId && !packageId) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <EmptyState
          title={t("checkout.invalid.title")}
          message={t("checkout.invalid.body")}
          icon={AlertCircle}
          action={
            <Link to="/explore" className={studentBtnPrimary}>
              {t("checkout.backExplore")}
            </Link>
          }
        />
      </div>
    );
  }

  const courseMissing = courseId && courseFetched && !courseError && !course;
  const packageMissing = packageId && packageFetched && !packageError && !coursePackage;
  const priceLabel = formatPrice(finalAmount, isRtl);
  const originalPriceLabel = formatPrice(courseAmount, isRtl);
  const discountLabel = formatPrice(discountAmount, isRtl);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponMessage(t("checkout.coupon.enterCode"));
      setAppliedCoupon(null);
      return;
    }
    setCouponValidating(true);
    setCouponMessage("");
    try {
      const coupon = await validateStudentCoupon({
        code,
        targetType: packageId ? "PACKAGE" : "COURSE",
        targetId: packageId || courseId,
      });
      setAppliedCoupon(coupon);
      const discounted = applyCouponDiscount(courseAmount, coupon);
      setCouponMessage(
        t("checkout.coupon.appliedWithDiscount", {
          discount: couponDiscountLabel(coupon, isRtl),
          price: formatPrice(discounted, isRtl),
          defaultValue: `Coupon applied — ${couponDiscountLabel(coupon, isRtl)} off. New total: ${formatPrice(discounted, isRtl)}`,
        })
      );
    } catch (e) {
      setAppliedCoupon(null);
      setCouponMessage(getErrorMessage(e, t("checkout.coupon.invalid")));
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
  };

  const handlePurchase = async () => {
    if (!courseId && !packageId) return;
    setLocalError("");
    let url = receiptUrl.trim();
    if (finalAmount > 0 && !url && !proofFile) {
      setLocalError(t("checkout.package.receiptRequired"));
      return;
    }
    if (url && !isValidReceiptUrl(url)) {
      setLocalError(t("checkout.package.receiptUrlInvalid"));
      return;
    }
    if (!finalAmount && finalAmount !== 0) {
      setLocalError(t("checkout.package.amountInvalid"));
      return;
    }
    setSubmitting(true);
    try {
      if (proofFile) {
        const uploaded = await uploadPaymentProof(proofFile);
        url = uploaded?.receiptUrl || url;
      }
      const payload = {
        paymentMethod,
        receiptUrl: url || "INSTANT_FREE_ENROLLMENT",
        amount: finalAmount,
        studentNote: studentNote.trim() || undefined,
      };
      if (packageId) {
        if (pricingTierId) {
          payload.pricingTierId = pricingTierId;
        }
        if (appliedCoupon?.code) {
          payload.couponCode = appliedCoupon.code;
        } else if (couponCode.trim()) {
          payload.couponCode = couponCode.trim();
        }
        const data = await postStudentPackageCheckout(packageId, payload);
        const reused = Boolean(data?.reusedPending);
        setOrderMeta({ reusedPending: reused });
        setFlow("success");
        void queryClient.invalidateQueries({ queryKey: ["student", "payments"] });
        toast.success(
          reused
            ? t("checkout.cohort.successToastReused", {
                defaultValue: "Updated your existing pending payment (no new row).",
              })
            : t("checkout.package.successToast", { defaultValue: "Package payment submitted." })
        );
      } else {
        if (pricingTierId) {
          payload.pricingTierId = pricingTierId;
        }
        if (appliedCoupon?.code) {
          payload.couponCode = appliedCoupon.code;
        } else if (couponCode.trim()) {
          payload.couponCode = couponCode.trim();
        }
        const data = await postStudentCourseCheckout(courseId, payload);
        const reused = Boolean(data?.reusedPending);
        setOrderMeta({ reusedPending: reused });
        setFlow("success");
        void queryClient.invalidateQueries({ queryKey: ["student", "payments"] });
        toast.success(
          reused
            ? t("checkout.cohort.successToastReused", {
                defaultValue: "Updated your existing pending payment (no new row).",
              })
            : t("checkout.cohort.successToast", { defaultValue: "Payment submitted." })
        );
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 409) {
        setLocalError(isRtl ? "أنت بالفعل مشترك في هذا المحتوى." : "You already have access to this.");
        return;
      }
      setLocalError(getErrorMessage(e, t("checkout.cohort.directSubmitError", { defaultValue: "Could not submit payment." })));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav className="text-sm font-medium text-slate-500">
        <Link to="/explore" className="font-bold text-[var(--yu-blue-700)] hover:underline dark:text-[var(--yu-blue-400)]">
          {t("checkout.breadcrumbExplore")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">{t("checkout.title")}</span>
      </nav>

      <PageHeader
        title={flow === "success" ? t("checkout.cohort.successTitle", { defaultValue: "Payment submitted" }) : t("checkout.title")}
        subtitle={flow !== "success" ? t("checkout.subtitle") : undefined}
      />

      <StudentSurface className="space-y-6">
          {flow === "success" ? (
            <>
              <div className="flex justify-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
              </div>
              <p className="text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {orderMeta.reusedPending
                  ? t("checkout.cohort.successPendingNote")
                  : t("checkout.cohort.successBody", {
                      defaultValue: "Your payment is pending review. You will get access once approved.",
                    })}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/student/classes" className={studentBtnPrimary}>
                  {t("checkout.goToClasses")}
                </Link>
                <Link to="/student/payments" className={studentBtnGhost}>
                  {t("checkout.viewPayments", { defaultValue: "View payments" })}
                </Link>
              </div>
            </>
          ) : null}

          {flow !== "success" && (courseLoading || packageLoading) ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("checkout.loading")}
            </div>
          ) : null}

          {flow !== "success" && courseError ? <p className="text-sm text-red-600">{t("checkout.courseLoadError")}</p> : null}
          {flow !== "success" && packageError ? <p className="text-sm text-red-600">{t("subscription.loadError", { defaultValue: "Could not load package." })}</p> : null}
          {flow !== "success" && courseMissing ? <p className="text-sm text-red-600">{t("checkout.courseNotFound")}</p> : null}
          {flow !== "success" && packageMissing ? <p className="text-sm text-red-600">{t("subscription.empty", { defaultValue: "Package not found." })}</p> : null}

          {flow !== "success" && course && !courseLoading ? (
            <StudentSurface className="bg-slate-50/80 dark:bg-[#0C1829]/60">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("checkout.courseLabel")}</p>
              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{course.title}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {t("courseDetails.type.recorded", { defaultValue: "Recorded" })}
                {selectedTier ? ` · ${isRtl ? (selectedTier.nameAr || selectedTier.name) : selectedTier.name}` : ""}
              </p>
              <p className="mt-2 text-lg font-black text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-400)]">{priceLabel}</p>
              {appliedCoupon && discountAmount > 0 ? (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-slate-500 line-through dark:text-slate-400">
                    {t("checkout.coupon.originalPrice", { defaultValue: "Original price" })}: {originalPriceLabel}
                  </p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {t("checkout.coupon.discount", { defaultValue: "Discount" })}: −{discountLabel} ({appliedCoupon.code})
                  </p>
                </div>
              ) : null}
            </StudentSurface>
          ) : null}

          {flow !== "success" && coursePackage && !packageLoading ? (
            <StudentSurface className="bg-slate-50/80 dark:bg-[#0C1829]/60">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("sidebarNav.items.packages", { defaultValue: "Package" })}</p>
              <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{coursePackage.title}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {(coursePackage.courses || []).length} {t("subscription.includedCourses", { defaultValue: "courses included" })}
                {selectedTier ? ` · ${isRtl ? (selectedTier.nameAr || selectedTier.name) : selectedTier.name}` : ""}
              </p>
              <p className="mt-2 text-lg font-black text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-400)]">{priceLabel}</p>
            </StudentSurface>
          ) : null}

          {flow !== "success" && course && !course.isLifetimePurchasable ? (
            <StudentSurface className="border-amber-200/80 bg-amber-50/60 text-sm font-medium text-amber-900 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-200">
              {t("courseDetails.card.notPurchasable", { defaultValue: "This course is not available for purchase." })}
            </StudentSurface>
          ) : null}

          {flow !== "success" && (((course && course.isLifetimePurchasable) || coursePackage)) ? (
            <>
              {courseId || packageId ? (
                <StudentSurface className="bg-slate-50/80 dark:bg-[#0C1829]/60">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("checkout.coupon.label")}</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (appliedCoupon) {
                          setAppliedCoupon(null);
                          setCouponMessage("");
                        }
                      }}
                      placeholder={t("checkout.coupon.placeholder")}
                      className={`${studentFieldClass} flex-1`}
                    />
                    <button
                      type="button"
                      disabled={couponValidating}
                      onClick={() => void handleApplyCoupon()}
                      className={studentBtnGhost}
                    >
                      {couponValidating ? t("dashboard.common.loading") : t("checkout.coupon.apply")}
                    </button>
                    {appliedCoupon ? (
                      <button type="button" onClick={handleRemoveCoupon} className={studentBtnGhost}>
                        {t("checkout.coupon.remove", { defaultValue: "Remove" })}
                      </button>
                    ) : null}
                  </div>
                  {couponMessage ? (
                    <p className={`mt-2 text-sm ${appliedCoupon ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>
                      {couponMessage}
                    </p>
                  ) : null}
                </StudentSurface>
              ) : null}

              <div>
                {(course?.paymentInstructions || coursePackage?.paymentInstructions) ? (
                  <StudentSurface className="mb-4 border-[var(--yu-blue-200)]/80 bg-[var(--yu-blue-50)]/40 text-sm text-slate-700 dark:border-[var(--yu-blue-800)]/40 dark:bg-[var(--yu-blue-700)]/8 dark:text-slate-200">
                    <p className="font-black">{(course?.paymentInstructions || coursePackage?.paymentInstructions).methodLabel || t("checkout.package.paymentMethod")}</p>
                    <p className="mt-1 font-medium">{(course?.paymentInstructions || coursePackage?.paymentInstructions).instructions}</p>
                    {(course?.paymentInstructions || coursePackage?.paymentInstructions).destinationUrl ? (
                      <a href={(course?.paymentInstructions || coursePackage?.paymentInstructions).destinationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block font-bold text-[var(--yu-blue-700)] hover:underline dark:text-[var(--yu-blue-400)]">
                        {t("checkout.openPaymentDestination", { defaultValue: "Open payment destination" })}
                      </a>
                    ) : null}
                  </StudentSurface>
                ) : null}
                <label htmlFor="pay-method" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("checkout.package.paymentMethod")}
                </label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={`${studentSelectClass} mt-1`}
                >
                  <option value="BANK_TRANSFER">{t("checkout.package.methodBank")}</option>
                  <option value="CARD">{t("checkout.package.methodCard")}</option>
                  <option value="OTHER">{t("checkout.package.methodOther")}</option>
                </select>
              </div>

              <div>
                <label htmlFor="receipt-url" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("checkout.package.receiptUrl", { defaultValue: "Payment proof link" })}
                </label>
                <input
                  id="receipt-url"
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://"
                  className={`${studentFieldClass} mt-1`}
                />
                <p className="mt-1 text-xs font-medium text-slate-500">{t("checkout.package.receiptHint")}</p>
              </div>
              <div>
                <label htmlFor="receipt-file" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("checkout.proofUpload", { defaultValue: "Or upload proof file" })}
                </label>
                <input
                  id="receipt-file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className={`${studentFieldClass} mt-1 file:me-3 file:rounded-lg file:border-0 file:bg-[var(--yu-blue-700)] file:px-3 file:py-1 file:text-xs file:font-bold file:text-white`}
                />
                <p className="mt-1 text-xs font-medium text-slate-500">{proofFile ? `${proofFile.name} · ${Math.round(proofFile.size / 1024)} KB` : t("checkout.proofUploadHint", { defaultValue: "PDF, JPG, PNG, or WEBP up to 8 MB." })}</p>
              </div>
              <div>
                <label htmlFor="student-note" className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("checkout.studentNote", { defaultValue: "Note for reviewer" })}
                </label>
                <textarea
                  id="student-note"
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  rows={3}
                  className={`${studentFieldClass} mt-1`}
                />
              </div>
            </>
          ) : null}

          {flow !== "success" && localError ? (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{localError}</span>
            </div>
          ) : null}

          {flow !== "success" && (((course && course.isLifetimePurchasable) || coursePackage)) ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                to={packageId ? "/subscription" : `/courses/${courseId}`}
                className={studentBtnGhost}
              >
                {t("checkout.cancel")}
              </Link>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handlePurchase()}
                className={studentBtnPrimary}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {t("checkout.cohort.payCohort", { price: priceLabel })}
              </button>
            </div>
          ) : null}
      </StudentSurface>
    </div>
  );
}
