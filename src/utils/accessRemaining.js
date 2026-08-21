/**
 * Format remaining course access for UI.
 * @returns {{ label: string, tone: 'emerald'|'amber'|'rose'|'slate', daysLeft: number|null }}
 */
export function formatAccessRemaining(expiresAt, { isAr = false } = {}) {
  if (expiresAt == null || expiresAt === "") {
    return {
      label: isAr ? "وصول مدى الحياة" : "Lifetime access",
      tone: "slate",
      daysLeft: null,
    };
  }
  const end = new Date(expiresAt);
  if (Number.isNaN(end.getTime())) {
    return {
      label: isAr ? "وصول مدى الحياة" : "Lifetime access",
      tone: "slate",
      daysLeft: null,
    };
  }
  const ms = end.getTime() - Date.now();
  if (ms <= 0) {
    return {
      label: isAr ? "انتهى الوصول" : "Access expired",
      tone: "rose",
      daysLeft: 0,
    };
  }
  const daysLeft = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (daysLeft <= 7) {
    return {
      label: isAr ? `${daysLeft} يوم متبقٍ` : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
      tone: "amber",
      daysLeft,
    };
  }
  return {
    label: isAr ? `${daysLeft} يوم متبقٍ` : `${daysLeft} days left`,
    tone: "emerald",
    daysLeft,
  };
}

export function accessBadgeClass(tone) {
  if (tone === "rose") return "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300";
  if (tone === "amber") return "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200";
  if (tone === "emerald") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300";
  return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300";
}
