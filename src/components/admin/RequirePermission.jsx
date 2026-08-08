import { Navigate } from "react-router-dom";
import PermissionGate from "../ui/PermissionGate";

/**
 * Route-level permission gate. Use inside admin route elements.
 * Super-admins (hasAdminAccess already passed) still need matching permission unless omitted.
 */
export default function RequirePermission({ permission, anyOf, children }) {
  return (
    <PermissionGate
      permission={permission}
      anyOf={anyOf}
      fallback={<Navigate to="/access-denied" replace />}
    >
      {children}
    </PermissionGate>
  );
}
