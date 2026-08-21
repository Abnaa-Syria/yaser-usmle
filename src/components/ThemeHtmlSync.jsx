import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function isDashboardPath(pathname) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/trial")
  );
}

/**
 * Applies `dark` on <html> for dashboard shells (/admin, /instructor, /student)
 * using the user's stored preference — including course learn. Public marketing
 * routes stay in light mode.
 */
export default function ThemeHtmlSync() {
  const { pathname } = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (!isDashboardPath(pathname)) {
      root.classList.remove("dark");
      return;
    }
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [pathname, theme]);

  return null;
}
