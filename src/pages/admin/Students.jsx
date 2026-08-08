import { Eye, Plus, Search, UserCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAdminUsers, useCreateStudentByAdmin, useSetAdminUserPassword, useUpdateAdminUser } from "../../features/admin/users/hooks";
import PageHeader from "../../components/ui/PageHeader";
import StatsRow from "../../components/ui/StatsRow";
import FilterBar from "../../components/ui/FilterBar";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { getErrorMessage } from "../../api/error";

function Students() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const query = {
    role: "STUDENT",
    search: search || undefined,
    isActive: status === "all" ? undefined : status === "active" ? "true" : "false",
    page,
    limit: pageSize,
  };
  const { data, isLoading, isError, error, refetch } = useAdminUsers(query);
  const updateMutation = useUpdateAdminUser();
  const createMutation = useCreateStudentByAdmin();
  const setPasswordMutation = useSetAdminUserPassword();
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPassword, setModalPassword] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalIsActive, setModalIsActive] = useState(true);

  const students = data?.users || [];
  const meta = data?.meta;
  const total = meta?.total ?? students.length;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  const filtered = useMemo(() => {
    const rows = [...students].sort((a, b) => {
      if (sort === "nameAz") return String(a.fullName || "").localeCompare(String(b.fullName || ""));
      if (sort === "oldest") return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
    return rows;
  }, [students, sort]);

  const columns = [
    {
      key: "name",
      title: t("adminPages.students.table.name"),
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-white">
            {String(row.fullName || "ST").split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">{row.fullName || "-"}</span>
          </div>
        </div>
      ),
    },
    { key: "email", title: t("adminPages.students.table.email") },
    {
      key: "enrolledCourses",
      title: t("adminPages.students.table.courses"),
      render: (_, row) => (
        <div className="max-w-[240px]">
          <span className="font-semibold text-slate-900 dark:text-white">{row.enrollmentCount ?? 0}</span>
          {row.coursesSummary ? (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400" title={row.coursesSummary}>
              {row.coursesSummary}
            </p>
          ) : (
            <p className="text-xs text-slate-400">—</p>
          )}
        </div>
      ),
    },
    { key: "joinDate", title: t("adminPages.students.table.joined"), render: (_, row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-" },
    {
      key: "status",
      title: t("adminPages.students.table.status"),
      render: (_, row) => (
        <StatusBadge
          label={row.isActive ? t("dashboard.common.active") : t("dashboard.common.inactive")}
          tone={row.isActive ? "success" : "warning"}
        />
      ),
    },
    {
      key: "actions",
      title: t("adminPages.students.table.actions"),
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setEditing(row);
              setModalName(row.fullName || "");
              setModalEmail(row.email || "");
              setModalPassword("");
              setModalPhone(row.phone || "");
              setModalIsActive(row.isActive !== false);
            }}
            className="inline-flex rounded-md px-2.5 py-1.5 text-xs font-bold text-[var(--yu-blue-700)] hover:bg-[var(--yu-blue-700)]/10 transition"
          >
            {t("adminPages.students.edit")}
          </button>
          <Link to={`/admin/students/${row.id || row.userId}`} className="inline-flex rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/15">
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.students.title")}
        subtitle={t("adminPages.students.subtitle")}
        action={
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setModalName("");
              setModalEmail("");
              setModalPassword("");
              setModalPhone("");
              setModalIsActive(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-opacity-95 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("adminPages.students.addStudent")}
          </button>
        }
      />
      <StatsRow
        items={[
          {
            key: "total",
            label: t("adminPages.students.totalStudents"),
            value: data?.meta?.studentStats?.totalAll ?? data?.meta?.total ?? students.length,
            icon: Users,
            iconWrap: "bg-blue-500/10 text-blue-400",
          },
          {
            key: "month",
            label: t("adminPages.students.joinedThisMonth"),
            value: data?.meta?.studentStats?.joinedThisMonth ?? "—",
            icon: UserCheck,
            iconWrap: "bg-green-500/10 text-green-400",
          },
          {
            key: "new",
            label: t("adminPages.students.newThisWeek"),
            value: data?.meta?.studentStats?.joinedThisWeek ?? 0,
            icon: Plus,
            iconWrap: "bg-orange-500/10 text-[var(--yu-blue-700)]",
          },
        ]}
      />
      <FilterBar>
        <div className="relative lg:col-span-5">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t("adminPages.students.searchPlaceholder")}
            className="h-10 w-full rounded-lg border border-slate-200 ps-9 pe-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-3 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        >
          <option value="all">{t("adminPages.students.filters.all")}</option>
          <option value="active">{t("adminPages.students.filters.active")}</option>
          <option value="suspended">{t("adminPages.students.filters.suspended")}</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        >
          <option value="newest">{t("adminPages.students.sort.newest")}</option>
          <option value="oldest">{t("adminPages.students.sort.oldest")}</option>
          <option value="nameAz">{t("adminPages.students.sort.nameAz")}</option>
        </select>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
          aria-label={t("adminPages.pagination.pageSize", { defaultValue: isRtl ? "عدد الصفوف" : "Rows per page" })}
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {t("adminPages.pagination.pageSize", { defaultValue: isRtl ? "عدد الصفوف" : "Rows per page" })}: {size}
            </option>
          ))}
        </select>
      </FilterBar>

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-300">
          {getErrorMessage(error, t("adminPages.students.loadError"))}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        filtered.length === 0 ? (
          <EmptyState title={t("adminPages.students.empty")} />
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              rows={filtered}
              pagination={
                <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-slate-600 dark:text-slate-400">
                  <span>
                    {t("adminPages.pagination.page", {
                      page,
                      totalPages,
                      defaultValue: isRtl ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`,
                    })}
                    <span className="ms-2 text-xs text-slate-400">
                      ({total.toLocaleString()} {isRtl ? "طالب" : "students"})
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="hidden items-center gap-2 text-xs font-semibold sm:inline-flex">
                      {t("adminPages.pagination.pageSize", { defaultValue: isRtl ? "عدد الصفوف" : "Rows per page" })}
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPage(1);
                        }}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                      >
                        {[10, 25, 50, 100].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      {t("adminPages.pagination.prev")}
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      {t("adminPages.pagination.next")}
                    </button>
                  </div>
                </div>
              }
            />
          </div>
        )
      ) : null}

      {/* CREATE STUDENT MODAL */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A22] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
              {t("adminPages.students.createTitle")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminPages.students.fullName")} *
                </label>
                <input
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder={t("adminPages.students.table.name")}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminPages.students.emailAddress")} *
                </label>
                <input
                  required
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder={t("adminPages.students.table.email")}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminPages.students.phoneNumber")}
                </label>
                <input
                  type="tel"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  placeholder="+201..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminPages.students.password")} *
                </label>
                <input
                  type="password"
                  required
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  placeholder={t("adminPages.students.passwordPlaceholder")}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-white/10 dark:text-white dark:hover:bg-slate-800"
              >
                {t("adminPages.students.cancel")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!modalName || !modalEmail || modalPassword.length < 8) {
                    toast.error(t("adminPages.students.createValidation"));
                    return;
                  }
                  try {
                    await createMutation.mutateAsync({
                      fullName: modalName,
                      email: modalEmail,
                      password: modalPassword,
                      confirmPassword: modalPassword,
                      phone: modalPhone || undefined,
                    });
                    toast.success(t("adminPages.students.createSuccess"));
                    setCreating(false);
                    setModalName("");
                    setModalEmail("");
                    setModalPassword("");
                    setModalPhone("");
                    refetch();
                  } catch (err) {
                    toast.error(getErrorMessage(err, t("adminPages.students.createFailed")));
                  }
                }}
                className="rounded-xl bg-[var(--yu-blue-700)] px-5 py-2.5 text-sm font-bold text-white transition"
              >
                {createMutation.isPending ? t("adminPages.students.saving") : t("adminPages.students.saveStudent")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A22] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
              {t("adminPages.students.editTitle")}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminPages.students.fullName")}
                </label>
                <input
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminPages.students.emailAddress")}
                </label>
                <input
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t("adminPages.students.phoneNumber")}
                </label>
                <input
                  type="tel"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--yu-blue-700)] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0F0F13] border border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t("adminPages.students.accountStatus")}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("adminPages.students.accountStatusHint")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isActiveToggle"
                    type="checkbox"
                    checked={modalIsActive}
                    onChange={(e) => setModalIsActive(e.target.checked)}
                    className="rounded text-[var(--yu-blue-700)] focus:ring-[var(--yu-blue-700)]/30 h-5 w-5 cursor-pointer"
                  />
                  <label htmlFor="isActiveToggle" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    {modalIsActive ? t("adminPages.students.active") : t("adminPages.students.suspended")}
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <p className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                {t("adminPages.students.updatePasswordOptional")}
              </p>
              <p className="mt-1">
                {t("adminPages.students.updatePasswordHint")}
              </p>
              <input
                type="password"
                value={modalPassword}
                onChange={(e) => setModalPassword(e.target.value)}
                placeholder={t("adminPages.students.newPasswordPlaceholder")}
                className="mt-2.5 h-10 w-full rounded-xl border border-amber-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-amber-500 dark:border-amber-500/30 dark:bg-[#0F0F13] dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => { setEditing(null); setModalPassword(""); }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-white/10 dark:text-white dark:hover:bg-slate-800"
              >
                {t("adminPages.students.cancel")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateMutation.mutateAsync({
                      id: editing.id,
                      body: {
                        fullName: modalName,
                        email: modalEmail,
                        phone: modalPhone || undefined,
                        isActive: modalIsActive,
                      },
                    });
                    if (modalPassword) {
                      if (modalPassword.length < 8) {
                        toast.error(t("adminPages.students.passwordMinError"));
                        return;
                      }
                      await setPasswordMutation.mutateAsync({ id: editing.id, newPassword: modalPassword });
                    }
                    toast.success(t("adminPages.students.updateSuccess"));
                    setEditing(null);
                    setModalPassword("");
                    refetch();
                  } catch (err) {
                    toast.error(getErrorMessage(err, t("adminPages.students.updateFailed")));
                  }
                }}
                className="rounded-xl bg-[var(--yu-blue-700)] px-5 py-2.5 text-sm font-bold text-white transition"
              >
                {updateMutation.isPending ? t("adminPages.students.saving") : t("adminPages.students.saveChanges")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Students;
