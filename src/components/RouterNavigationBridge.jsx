import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setRouterNavigateReplace } from "../lib/routerNavigation";

export default function RouterNavigationBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    setRouterNavigateReplace((to) => {
      navigate(to, { replace: true });
    });
    return () => setRouterNavigateReplace(null);
  }, [navigate]);

  return null;
}
