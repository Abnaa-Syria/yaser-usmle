import fs from "fs";
import path from "path";

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx?|tsx?)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function get(obj, key) {
  return key.split(".").reduce((a, k) => (a == null ? undefined : a[k]), obj);
}

const ar = JSON.parse(fs.readFileSync("src/i18n/locales/ar.json", "utf8"));
const en = JSON.parse(fs.readFileSync("src/i18n/locales/en.json", "utf8"));

const dirs = [
  "src/pages/admin",
  "src/pages/student",
  "src/pages",
  "src/layouts",
  "src/components",
];
const files = dirs.flatMap((d) => walk(d));

const used = new Map(); // key -> defaultValue if found
const re = /t\(\s*["']([^"']+)["'](?:\s*,\s*\{([^}]*)\})?/g;
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  let m;
  while ((m = re.exec(s))) {
    const key = m[1];
    const opts = m[2] || "";
    const dv = opts.match(/defaultValue:\s*["'`]([^"'`]*)["'`]/);
    if (!used.has(key)) used.set(key, dv ? dv[1] : null);
  }
}

const missingAdmin = [];
const missingStudent = [];
for (const [key, dv] of used) {
  if (get(ar, key) !== undefined) continue;
  if (key.startsWith("adminPages.")) missingAdmin.push([key, dv]);
  else if (
    key.startsWith("student.") ||
    key.startsWith("exams.") ||
    key.startsWith("exam") ||
    key.startsWith("takeExam.") ||
    key.startsWith("progress.") ||
    key.startsWith("settings.") ||
    key.startsWith("header.") ||
    key.startsWith("sidebarNav.") ||
    key.startsWith("common.")
  ) {
    missingStudent.push([key, dv]);
  }
}

console.log("=== Missing adminPages keys:", missingAdmin.length, "===");
for (const [k, dv] of missingAdmin.sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(k + (dv ? ` | ${dv}` : ""));
}
console.log("\n=== Missing student-facing keys:", missingStudent.length, "===");
for (const [k, dv] of missingStudent.sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(k + (dv ? ` | ${dv}` : ""));
}
console.log("\nen has adminPages?", !!en.adminPages);
