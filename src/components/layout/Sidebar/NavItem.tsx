import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { NavItem as NavItemType } from "../../../config/navigation";

type Props = {
  item: NavItemType;
  isSubItem?: boolean;
  isCollapsed?: boolean;
};

function NavItem({ item, isSubItem = false, isCollapsed = false }: Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = item.exact
    ? location.pathname === item.path
    : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

  if (isSubItem) {
    return (
      <NavLink
        to={item.path}
        className={`relative mx-1 flex items-center gap-2 rounded-md py-1.5 pe-3 ps-8 text-[13px] transition-all duration-150 border-s-2 ${
          isActive
            ? "bg-blue-50 text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/10 dark:text-[var(--yu-blue-300)] font-semibold border-[var(--yu-blue-600)]"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-300 border-transparent"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
        <span>{t(item.labelKey)}</span>
      </NavLink>
    );
  }

  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      title={isCollapsed ? t(item.labelKey) : undefined}
      className={`relative mx-1 flex items-center rounded-xl py-2 text-[13px] transition-all duration-150 ${
        isCollapsed ? "justify-center px-2" : "gap-2.5 px-3"
      } ${
        isActive
          ? "bg-[var(--yu-blue-50)] text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/10 dark:text-[var(--yu-blue-300)] font-semibold"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed ? <span className="truncate">{t(item.labelKey)}</span> : null}
      {typeof item.badge === "number" && item.badge > 0 && !isCollapsed ? (
        <span className={`ms-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
          isActive
            ? "bg-[var(--yu-blue-100)] text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/20 dark:text-[var(--yu-blue-300)]"
            : "bg-[var(--yu-blue-700)] text-white"
        }`}>
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}

export default NavItem;
