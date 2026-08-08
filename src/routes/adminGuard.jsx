import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { hasAdminAccess } from "../config/permissions";

function AdminGuard() {
  const location = useLocation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 dark:bg-[#0F0F13]">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Block students/instructors without staff permissions from any /admin path.
  if (!hasAdminAccess(user)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}

export default AdminGuard;
