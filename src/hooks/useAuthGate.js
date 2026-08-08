import useAuthStore from "../store/authStore";
import { hasAnyRole } from "../config/permissions";

function useAuthGate(allowedRoles = []) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  return {
    isAuthenticated,
    user,
    isAllowed: isAuthenticated && hasAnyRole(user, allowedRoles),
  };
}

export default useAuthGate;
