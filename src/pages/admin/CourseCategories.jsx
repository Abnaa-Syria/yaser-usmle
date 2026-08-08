import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  Folder,
  Layers,
  Laptop,
  Code2,
  Cpu,
  Globe,
  Database,
  BookOpen,
  Atom,
  Calculator,
  Wrench,
  Settings,
  Terminal,
  Network,
  HardDrive,
  Blocks,
  LineChart,
  Book,
  FileText,
  Video,
  Brain,
  PenTool,
  Server,
  Eye,
  Zap,
  Lightbulb,
  Radio,
  Binary,
  HardHat,
  Construction,
  Building,
  Ruler,
  Map,
  FlaskConical,
  Gauge,
  Activity,
  Wind,
  Plane,
  Droplets,
  Hammer
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getErrorMessage } from "../../api/error";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "../../features/admin/categories/hooks";

const ICON_LIST = [
  // Clinical practice and review
  { name: "Wrench", Icon: Wrench, labelAr: "مهارات سريرية" },
  { name: "Settings", Icon: Settings, labelAr: "أنظمة الأعضاء" },
  { name: "Gauge", Icon: Gauge, labelAr: "تقييم الأداء" },
  { name: "Hammer", Icon: Hammer, labelAr: "تدريب على الأسئلة" },
  
  // Neurophysiology and diagnostics
  { name: "Zap", Icon: Zap, labelAr: "فسيولوجيا الأعصاب" },
  { name: "Lightbulb", Icon: Lightbulb, labelAr: "مفاهيم عالية الأهمية" },
  { name: "Radio", Icon: Radio, labelAr: "الإشارات العصبية" },
  { name: "Cpu", Icon: Cpu, labelAr: "الجهاز العصبي المركزي" },
  
  // Anatomy and study planning
  { name: "HardHat", Icon: HardHat, labelAr: "سلامة المريض" },
  { name: "Construction", Icon: Construction, labelAr: "التشريح وعلم الأنسجة" },
  { name: "Building", Icon: Building, labelAr: "بنية الجسم" },
  { name: "Ruler", Icon: Ruler, labelAr: "القياسات السريرية" },
  { name: "Map", Icon: Map, labelAr: "خرائط التشريح" },

  // Learning resources and integrated systems
  { name: "Code2", Icon: Code2, labelAr: "استراتيجيات حل الأسئلة" },
  { name: "Terminal", Icon: Terminal, labelAr: "مراجعة مركزة" },
  { name: "Database", Icon: Database, labelAr: "بنك الأسئلة" },
  { name: "Server", Icon: Server, labelAr: "مصادر المذاكرة" },
  { name: "Network", Icon: Network, labelAr: "التكامل بين الأنظمة" },
  { name: "Globe", Icon: Globe, labelAr: "الصحة العالمية" },
  { name: "Laptop", Icon: Laptop, labelAr: "تعلم إلكتروني" },
  { name: "Blocks", Icon: Blocks, labelAr: "العلوم الأساسية" },

  // Basic and organ-system sciences
  { name: "FlaskConical", Icon: FlaskConical, labelAr: "الكيمياء الحيوية" },
  { name: "Atom", Icon: Atom, labelAr: "البيولوجيا الجزيئية" },
  { name: "Activity", Icon: Activity, labelAr: "القلب والأوعية الدموية" },
  { name: "Wind", Icon: Wind, labelAr: "الجهاز التنفسي" },
  { name: "Plane", Icon: Plane, labelAr: "الطب الوقائي" },
  { name: "Droplets", Icon: Droplets, labelAr: "الكلى والشوارد" },

  // Academic & Core Science
  { name: "Calculator", Icon: Calculator, labelAr: "الحسابات الطبية" },
  { name: "LineChart", Icon: LineChart, labelAr: "الإحصاء الحيوي" },
  { name: "BookOpen", Icon: BookOpen, labelAr: "مناهج USMLE Step 1" },
  { name: "Brain", Icon: Brain, labelAr: "الأعصاب والعلوم السلوكية" },
  { name: "PenTool", Icon: PenTool, labelAr: "تدوين ومراجعة" },
];

function CategoryIcon({ name, className = "h-5 w-5" }) {
  const match = ICON_LIST.find((i) => i.name === name);
  const IconComponent = match ? match.Icon : Folder;
  return <IconComponent className={className} />;
}

function StatCard({ icon, value, label, bgColor, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bgColor} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
        <p className="text-xs font-bold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

const generateSlug = (val) => {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
};

function CourseCategories() {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [icon, setIcon] = useState("Folder");

  const { data, isLoading, isError, error, refetch } = useAdminCategories({ page: 1, limit: 100 });
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();
  
  const categories = data?.categories || [];

  // Filter possible parent categories (only top-level categories that aren't the current category itself)
  const topLevelCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId && c.id !== editingId);
  }, [categories, editingId]);

  const stats = useMemo(() => {
    const subCount = categories.filter((c) => !!c.parentId).length;
    const coursesCount = categories.reduce((sum, c) => sum + (c._count?.courses || 0), 0);
    return {
      total: categories.length,
      subcategories: subCount,
      coursesCount,
    };
  }, [categories]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("");
    setIcon("Folder");
    setModalOpen(true);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const onSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error(t("adminPages.categories.requiredFields"));
      return;
    }

    const body = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      parentId: parentId || null,
      icon: icon || null,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, body });
        toast.success(t("adminPages.categories.updated"));
      } else {
        await createMutation.mutateAsync(body);
        toast.success(t("adminPages.categories.created"));
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.categories.saveFailed")));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t("adminPages.categories.deleted"));
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.categories.deleteFailed")));
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={t("adminPages.categories.title")}
          subtitle={t("adminPages.categories.subtitle")}
        />
        <button
          onClick={handleOpenCreate}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-5 text-sm font-bold text-white shadow-lg shadow-[var(--yu-blue-700)]/25 hover:bg-[var(--yu-blue-600)] transition"
        >
          <Plus className="h-4 w-4" />
          {t("adminPages.categories.add")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          icon={<Layers className="h-6 w-6" />}
          value={stats.total}
          label={t("adminPages.categories.total")}
          bgColor="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<Folder className="h-6 w-6" />}
          value={stats.subcategories}
          label={t("adminPages.categories.subcategories")}
          bgColor="bg-amber-50 dark:bg-amber-500/10"
          iconColor="text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-700)]"
        />
        <StatCard
          icon={<BookOpen className="h-6 w-6" />}
          value={stats.coursesCount}
          label={t("adminPages.categories.activeCourses")}
          bgColor="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Categories Grid List */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <div className="text-sm text-slate-500 col-span-full">{t("adminPages.categories.loading")}</div>}
        {isError && (
          <div className="text-sm text-red-500 col-span-full">
            {getErrorMessage(error, t("adminPages.categories.loadError"))}{" "}
            <button onClick={() => refetch()} className="underline ms-2">{t("adminPages.categories.retry")}</button>
          </div>
        )}
        
        {categories.map((c) => (
          <div key={c.id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#1A1A22]">
            <div className="absolute inset-x-0 top-0 h-1 bg-[var(--yu-blue-700)]" />
            
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[var(--yu-blue-700)] dark:bg-[var(--yu-blue-700)]/10">
                <CategoryIcon name={c.icon} className="h-6 w-6" />
              </div>
              
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setName(c.name || "");
                    setSlug(c.slug || "");
                    setDescription(c.description || "");
                    setParentId(c.parentId || "");
                    setIcon(c.icon || "Folder");
                    setModalOpen(true);
                  }}
                  className="rounded-xl bg-slate-50 hover:bg-slate-100 p-2 text-slate-500 transition dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                  title={t("adminPages.categories.edit")}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(c)}
                  className="rounded-xl bg-[var(--yu-blue-700)]/10 hover:bg-[var(--yu-blue-700)]/20 p-2 text-red-600 transition"
                  title={t("adminPages.categories.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">slug: {c.slug}</p>
              
              {c.parent ? (
                <span className="inline-flex items-center gap-1 mt-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                  {t("adminPages.categories.subcategoryOf", { name: c.parent.name })}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  {t("adminPages.categories.topLevel")}
                </span>
              )}

              <div className="mt-4 border-t border-slate-100 dark:border-white/5 pt-3 flex justify-between text-xs text-slate-500">
                <span>{t("adminPages.categories.activeCoursesLabel")}</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {c._count?.courses || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Styled Centered Category Creation/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#1A1A22] border border-slate-200/60 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <header className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 p-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingId ? t("adminPages.categories.editTitle") : t("adminPages.categories.createTitle")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.categories.name")}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cardiovascular System"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[var(--yu-blue-700)] outline-none"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.categories.slug")}
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. web-development"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[var(--yu-blue-700)] outline-none"
                />
              </label>

              {/* Subcategory relation */}
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.categories.parent")}
                </span>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[var(--yu-blue-700)] outline-none"
                >
                  <option value="">{t("adminPages.categories.parentNone")}</option>
                  {topLevelCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>

              {/* Visual Icon Grid Picker */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.categories.selectIcon")}
                </span>
                <div className="grid grid-cols-6 gap-2 p-3 rounded-xl border border-slate-200 dark:border-white/10 max-h-[140px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40">
                  {ICON_LIST.map((item) => {
                    const IconComp = item.Icon;
                    const isSelected = icon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIcon(item.name)}
                        className={`flex h-10 items-center justify-center rounded-lg border transition ${isSelected ? "border-[var(--yu-blue-700)] bg-[var(--yu-blue-700)]/10 text-[var(--yu-blue-700)]" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500 dark:border-white/5 dark:bg-[#0F0F13] dark:hover:bg-white/5"}`}
                        title={item.name}
                      >
                        <IconComp className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.categories.description")}
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[var(--yu-blue-700)] outline-none"
                  placeholder="Details about study materials in this path..."
                />
              </label>

            </div>

            {/* Modal Footer */}
            <footer className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-white/5 p-6 shrink-0 bg-slate-50/50 dark:bg-slate-900/45">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 text-slate-700 px-4 h-10 text-xs font-bold dark:border-white/10 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-white/5 transition"
              >
                {t("adminPages.categories.cancel")}
              </button>
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] text-white px-5 h-10 text-xs font-bold hover:bg-[var(--yu-blue-600)] transition"
              >
                {editingId ? t("adminPages.categories.saveChanges") : t("adminPages.categories.add")}
              </button>
            </footer>

          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t("adminPages.categories.deleteTitle")}
        message={t("adminPages.categories.deleteConfirm")}
        confirmLabel={t("adminPages.categories.confirmDelete")}
        cancelLabel={t("adminPages.categories.cancel")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

    </section>
  );
}

export default CourseCategories;
