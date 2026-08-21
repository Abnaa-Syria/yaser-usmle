import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { APP_ROLES, hasAdminAccess, normalizeRole } from "../config/permissions";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import BrandLogo from "./BrandLogo";
import { platformFeatures } from "../config/features";
import { normalizePageVisibility } from "../utils/publicPageVisibility";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../features/student/notifications/hooks";

/* ── Helpers ── */
const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-[var(--yu-blue-700)] font-semibold dark:text-[var(--yu-blue-400)]" : "text-slate-700 hover:text-[var(--yu-blue-700)] dark:text-slate-300 dark:hover:text-[var(--yu-blue-400)]"
  }`;

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Localized display name for known demo accounts + role label. */
function getUserDisplayMeta(user, t, isAr) {
  const email = String(user?.email || "").toLowerCase();
  const roleName = String(user?.role?.name || user?.role || "").toUpperCase();

  const demoNamesAr = {
    "superadmin@yaserusmle.com": "مالك منصة ياسر",
    "admin@yaserusmle.com": "مريم عادل",
    "finance@yaserusmle.com": "عمر نبيل",
    "support@yaserusmle.com": "نور سمير",
    "reviewer@yaserusmle.com": "د. لينا مصطفى",
    "student@yaserusmle.com": "طالب تجريبي",
  };

  const roleLabelKey =
    roleName === "SUPER_ADMIN"
      ? "header.roles.superAdmin"
      : roleName === "ADMIN"
        ? "header.roles.admin"
        : roleName === "INSTRUCTOR"
          ? "header.roles.instructor"
          : roleName === "STUDENT"
            ? "header.roles.student"
            : "header.roles.staff";

  const displayName =
    isAr && demoNamesAr[email]
      ? demoNamesAr[email]
      : user?.fullName || t("header.roles.userFallback", { defaultValue: isAr ? "مستخدم" : "User" });

  return {
    displayName,
    roleLabel: t(roleLabelKey, {
      defaultValue:
        roleName === "SUPER_ADMIN"
          ? isAr
            ? "مالك المنصة"
            : "Platform owner"
          : roleName,
    }),
  };
}

function getRoleMenuItems(user) {
  if (hasAdminAccess(user)) {
    return [
      { icon: LayoutDashboard, labelKey: "header.dropdown.adminDashboard", to: "/admin" },
      { icon: Users, labelKey: "header.dropdown.students", to: "/admin/students" },
      { icon: BookOpen, labelKey: "header.dropdown.courses", to: "/admin/courses" },
      { icon: Settings2, labelKey: "header.dropdown.settings", to: "/admin/settings" },
    ];
  }

  const role = normalizeRole(user?.role);
  if (role === APP_ROLES.INSTRUCTOR) {
    return [
      { icon: LayoutDashboard, labelKey: "header.dropdown.instructorDashboard", to: "/instructor/dashboard" },
      { icon: BookOpen, labelKey: "header.dropdown.myCourses", to: "/instructor/courses" },
      { icon: ClipboardCheck, labelKey: "header.dropdown.exams", to: "/instructor/exams" },
      { icon: Settings2, labelKey: "header.dropdown.settings", to: "/instructor/settings" },
    ];
  }

  return [
    { icon: BookOpen, labelKey: "header.dropdown.myClasses", to: "/student/classes" },
    { icon: ClipboardCheck, labelKey: "header.dropdown.exams", to: "/student/exams" },
    { icon: TrendingUp, labelKey: "header.dropdown.progress", to: "/student/progress" },
    { icon: Settings2, labelKey: "header.dropdown.settings", to: "/student/settings" },
  ];
}

function UserAvatarMark({ user, className = "", textClassName = "text-sm font-bold" }) {
  const src = user?.avatar;
  if (src) {
    return <img src={src} alt="" className={`rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-center justify-center rounded-full bg-[var(--yu-blue-700)] font-bold text-white shadow-md ${textClassName} ${className}`}>
      {getInitials(user?.fullName)}
    </div>
  );
}

/* ── Dropdown animation variants ── */
const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -6,
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

/* ── User Dropdown Menu ── */
function UserDropdown({ user, onClose }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const menuItems = getRoleMenuItems(user);
  const { displayName, roleLabel } = getUserDisplayMeta(user, t, isAr);

  const handleNav = (to) => {
    navigate(to);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/");
  };

  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ transformOrigin: "top right" }}
      className="absolute end-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60"
    >
      {/* ── User header ── */}
      <div className="flex items-center gap-3 bg-[var(--yu-blue-50)] px-4 py-4 dark:bg-[var(--yu-blue-700)]/10">
        <UserAvatarMark user={user} className="h-11 w-11 shrink-0" textClassName="text-sm font-bold" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="truncate text-[11px] font-bold text-[var(--yu-blue-700)]">{roleLabel}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>

      {/* ── Menu items ── */}
      <div className="py-1.5">
        {menuItems.map(({ icon: Icon, labelKey, to }) => (
          <button
            key={to}
            type="button"
            onClick={() => handleNav(to)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm text-slate-700 transition-colors hover:bg-[var(--yu-blue-50)] hover:text-[var(--yu-blue-700)]"
          >
            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </div>

      {/* ── Separator ── */}
      <div className="mx-4 border-t border-slate-100" />

      {/* ── Logout ── */}
      <div className="py-1.5">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm font-medium text-[var(--yu-blue-700)] transition-colors hover:bg-[var(--yu-blue-50)]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{t("header.dropdown.logout")}</span>
        </button>
      </div>
    </motion.div>
  );
}

/* ── Avatar trigger + dropdown wrapper ── */
function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data: items = [], isLoading } = useNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = (items || []).filter((n) => !n.isRead).length;

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-600 transition hover:bg-[var(--yu-blue-50)] hover:text-[var(--yu-blue-700)]"
        aria-label={t("header.notifications")}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute end-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--yu-blue-700)] px-0.5 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute end-0 top-[calc(100%+8px)] z-50 w-80 max-h-[70vh] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <span className="text-xs font-bold text-slate-800">{t("header.notifications")}</span>
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-xs font-semibold text-[var(--yu-blue-700)] hover:underline"
              >
                {t("header.notificationsMarkAll")}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? <p className="p-4 text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
              {!isLoading && items.length === 0 ? <p className="p-4 text-sm text-slate-500">{t("header.notificationsEmpty")}</p> : null}
              {items.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (!n.isRead) markOne.mutate(n.id);
                  }}
                  className={`block w-full border-b border-slate-50 px-3 py-2.5 text-start text-sm transition hover:bg-slate-50 ${n.isRead ? "text-slate-600" : "bg-[var(--yu-blue-50)] font-medium text-slate-900"}`}
                >
                  <span className="block font-semibold">{n.title}</span>
                  <span className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function UserMenu() {
  const { t } = useTranslation();
  const user      = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("header.dropdown.open")}
        className="flex items-center gap-2 rounded-full ring-2 ring-transparent transition hover:ring-[var(--yu-blue-500)]/30 focus:outline-none focus:ring-[var(--yu-blue-500)]/40"
      >
        <UserAvatarMark user={user} className="h-9 w-9" textClassName="text-sm font-bold" />
        <ChevronDown
          className={`hidden h-3.5 w-3.5 text-slate-500 transition-transform duration-200 lg:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && <UserDropdown user={user} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

function LanguageMenu({ compact = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const currentLanguage = i18n.language?.startsWith("ar") ? "ar" : "en";

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selectLanguage = async (language) => {
    await i18n.changeLanguage(language);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={currentLanguage === "ar" ? "اختيار اللغة" : "Choose language"}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 ${
          compact ? "h-10 w-10" : "h-10 px-3"
        }`}
      >
        <Globe className="h-4 w-4" aria-hidden />
        {!compact ? <span className="text-xs">{currentLanguage === "ar" ? "العربية" : "English"}</span> : null}
        {!compact ? <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden /> : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 top-[calc(100%+8px)] z-[80] w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            {[
              { id: "ar", label: "العربية" },
              { id: "en", label: "English" },
            ].map((language) => (
              <button
                key={language.id}
                type="button"
                role="menuitem"
                onClick={() => selectLanguage(language.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                  currentLanguage === language.id ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{language.label}</span>
                <span className={`h-2 w-2 rounded-full ${currentLanguage === language.id ? "bg-blue-600" : "bg-transparent"}`} />
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════
   Main Header
══════════════════════════════════════ */
export default function Header() {
  const { t, i18n } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isStudent = normalizeRole(user?.role) === APP_ROLES.STUDENT;
  const isInstructor = normalizeRole(user?.role) === APP_ROLES.INSTRUCTOR;
  const isAdminUser = hasAdminAccess(user);
  const { settings: site } = useSiteSettings();

  const isRtl = i18n.language?.startsWith("ar");

  const navItems = [
    { to: "/", label: t("header.nav.home"), visibilityKey: "home" },
    { to: "/explore", label: t("header.nav.explore"), visibilityKey: "explore" },
    { to: "/packages", label: t("header.nav.packages", { defaultValue: isRtl ? "الباقات" : "Packages" }), visibilityKey: "packages" },
    platformFeatures.publicInstructorCatalog
      ? { to: "/instructors", label: t("header.nav.instructors", { defaultValue: "Instructors" }), visibilityKey: "instructors" }
      : null,
    platformFeatures.communityEvents
      ? { to: "/events", label: t("header.nav.events", { defaultValue: isRtl ? "الفعاليات والأخبار" : "Events & News" }), visibilityKey: "events" }
      : null,
    ...(isAuthenticated && isAdminUser
      ? [{ to: "/admin", label: t("header.dashboardMenu.adminPanel") }]
      : []),
    ...(isAuthenticated && isInstructor
      ? [{ to: "/instructor/dashboard", label: t("header.dashboardMenu.instructorPanel") }]
      : []),
    ...(isAuthenticated && isStudent
      ? [{ to: "/student", label: t("header.nav.myDashboard", { defaultValue: "My dashboard" }) }]
      : []),
    ...(isAuthenticated && isStudent && platformFeatures.privateBooking
      ? [{ to: "/instructors/platform-owner#book", label: t("header.nav.bookPrivate") }]
      : []),
  ].filter(Boolean);

  const pageVisibility = normalizePageVisibility(site.pageVisibility);
  const visibleNavItems = navItems.filter((item) => {
    if (!item.visibilityKey) return true;
    return pageVisibility[item.visibilityKey] !== false;
  });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      {/* ── Main Navbar ── */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Logo */}
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-85">
            <BrandLogo variant="primary" alt={site.siteName || t("header.logoAlt")} className="h-10 w-auto md:h-11" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {visibleNavItems.map((item) => (
              <NavLink key={`${item.to}-${item.label}`} to={item.to} className={navLinkClass} end={item.to === "/"}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions — auth aware */}
          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-5 py-2 text-sm font-medium text-slate-700 transition hover:text-[var(--yu-blue-700)]"
                >
                  {t("header.actions.login")}
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-[var(--yu-blue-700)] px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition hover:bg-[var(--yu-blue-600)] active:scale-[0.98]"
                >
                  {t("header.actions.signUp")}
                </Link>
              </>
            )}
            <LanguageMenu />
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            {isAuthenticated ? <NotificationBell /> : null}
            <LanguageMenu compact />
            <button
              type="button"
              className="rounded-md p-2 text-slate-700"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={t("header.mobile.menuToggle")}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 md:px-6">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2.5 text-sm font-medium text-start transition-colors ${
                      isActive
                        ? "bg-[var(--yu-blue-50)] text-[var(--yu-blue-700)]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}

              {/* Mobile auth section */}
              <div className="border-t border-slate-100 pt-3">
                {isAuthenticated ? (
                  <MobileUserSection onClose={() => setIsMenuOpen(false)} />
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 rounded-xl border border-slate-300 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:border-[var(--yu-blue-400)] hover:text-[var(--yu-blue-700)]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("header.actions.login")}
                    </Link>
                    <Link
                      to="/signup"
                      className="flex-1 rounded-xl bg-[var(--yu-blue-700)] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[var(--yu-blue-600)]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("header.actions.signUp")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── Mobile user section (inside hamburger menu) ── */
function MobileUserSection({ onClose }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith("ar");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const menuItems = getRoleMenuItems(user);
  const { displayName, roleLabel } = getUserDisplayMeta(user, t, isAr);

  return (
    <div className="space-y-0.5">
      <div className="mb-2 flex items-center gap-3 rounded-xl bg-[var(--yu-blue-50)] px-3 py-3">
        <UserAvatarMark user={user} className="h-9 w-9 shrink-0" textClassName="text-sm font-bold" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="truncate text-[11px] font-bold text-[var(--yu-blue-700)]">{roleLabel}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>

      {menuItems.map(({ icon: Icon, labelKey, to }) => (
        <button
          key={to}
          type="button"
          onClick={() => {
            navigate(to);
            onClose();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm text-slate-700 transition-colors hover:bg-[var(--yu-blue-50)] hover:text-[var(--yu-blue-700)]"
        >
          <Icon className="h-4 w-4 shrink-0 text-slate-400" />
          <span>{t(labelKey)}</span>
        </button>
      ))}

      <button
        type="button"
        onClick={async () => {
          onClose();
          await logout();
          navigate("/");
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-medium text-[var(--yu-blue-700)] transition-colors hover:bg-[var(--yu-blue-50)]"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>{t("header.dropdown.logout")}</span>
      </button>
    </div>
  );
}
