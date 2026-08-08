import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { hasAnyRole } from "../config/permissions";

function GuardedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 dark:bg-[#0F0F13]">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (!hasAnyRole(user, allowedRoles)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}

export default GuardedRoute;
