import fs from "fs";

for (const file of ["src/i18n/locales/ar.json", "src/i18n/locales/en.json"]) {
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const isAr = file.includes("ar.json");
  j.header = j.header || {};
  j.header.dashboardMenu = j.header.dashboardMenu || {};
  if (!j.header.dashboardMenu.adminPanel) {
    j.header.dashboardMenu.adminPanel = isAr ? "لوحة الإدارة" : "Admin panel";
  }
  j.common = j.common || {};
  if (!j.common.closeMenu) j.common.closeMenu = isAr ? "إغلاق القائمة" : "Close menu";
  if (!j.common.expandSidebar) j.common.expandSidebar = isAr ? "توسيع الشريط" : "Expand sidebar";
  if (!j.common.collapseSidebar) j.common.collapseSidebar = isAr ? "طي الشريط" : "Collapse sidebar";
  if (!j.header.themeToggle) j.header.themeToggle = isAr ? "تبديل المظهر" : "Toggle theme";
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
}
console.log("adminPanel + common keys ensured");
