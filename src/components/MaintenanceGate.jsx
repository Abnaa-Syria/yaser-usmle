import { useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { hasPermission } from "../config/permissions";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import MaintenancePage from "../pages/MaintenancePage";

function isAuthEscapePath(pathname) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-email")
  );
}

function canBypassMaintenance(user) {
  if (!user) return false;
  const roleName = String(user.role?.name || user.role || "").toUpperCase();
  if (roleName === "ADMIN" || roleName === "SUPER_ADMIN") return true;
  return hasPermission(user, "settings:manage") || hasPermission(user, "*");
}

/**
 * Blocks visitors/students while MAINTENANCE_MODE is on.
 * Logged-in admins/staff with settings access keep full platform access.
 */
export default function MaintenanceGate({ children }) {
  const location = useLocation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const { settings, isFetched, isError } = useSiteSettings();

  // Don't lock the site if public settings fail to load (avoid false lockout).
  if (!hydrated || (!isFetched && !isError)) {
    return children;
  }

  if (!settings.maintenanceMode) {
    return children;
  }

  // Staff may browse the whole site (preview) while visitors see maintenance.
  if (canBypassMaintenance(user)) {
    return children;
  }

  if (isAuthEscapePath(location.pathname)) {
    return children;
  }

  return <MaintenancePage />;
}
