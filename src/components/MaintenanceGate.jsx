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

/**
 * Blocks the public/student/instructor UI while MAINTENANCE_MODE is on.
 * Staff with settings:manage can still open /admin and auth pages to turn it off.
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

  const staffBypass = hasPermission(user, "settings:manage");
  const onAdminArea = location.pathname.startsWith("/admin");
  if (staffBypass && (onAdminArea || isAuthEscapePath(location.pathname))) {
    return children;
  }

  if (isAuthEscapePath(location.pathname)) {
    return children;
  }

  return <MaintenancePage />;
}
