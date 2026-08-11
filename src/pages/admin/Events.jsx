import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  MapPin,
  Video,
  Loader2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import client from "../../api/client";
import endpoints from "../../api/endpoints";
import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getErrorMessage } from "../../api/error";
import ImageField from "../../components/ui/ImageField";

const inputFieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--yu-blue-700)] focus:ring-2 focus:ring-[var(--yu-blue-700)]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[var(--yu-blue-700)]";

const textAreaClass =
  "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--yu-blue-700)] focus:ring-2 focus:ring-[var(--yu-blue-700)]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[var(--yu-blue-700)]";

export default function AdminEvents() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Confirm delete states
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await client.get(endpoints.admin.events);
      setEvents(res.data?.data?.events || []);
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.events.loadError")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitleAr("");
    setTitleEn("");
    setDescriptionAr("");
    setDescriptionEn("");
    // Default event date to tomorrow same time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEventDate(tomorrow.toISOString().slice(0, 16));
    setLocation("");
    setBannerUrl("");
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingId(ev.id);
    setTitleAr(ev.titleAr);
    setTitleEn(ev.titleEn);
    setDescriptionAr(ev.descriptionAr);
    setDescriptionEn(ev.descriptionEn);
    // Convert date back to datetime-local format
    const localDate = new Date(ev.eventDate).toISOString().slice(0, 16);
    setEventDate(localDate);
    setLocation(ev.location);
    setBannerUrl(ev.bannerUrl || "");
    setIsActive(ev.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!titleAr.trim() || !titleEn.trim() || !descriptionAr.trim() || !descriptionEn.trim() || !location.trim() || !eventDate) {
      toast.error(t("adminPages.events.requiredFields"));
      return;
    }

    setSubmitting(true);
    const payload = {
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim(),
      descriptionAr: descriptionAr.trim(),
      descriptionEn: descriptionEn.trim(),
      eventDate: new Date(eventDate).toISOString(),
      location: location.trim(),
      bannerUrl: bannerUrl.trim() || null,
      isActive
    };

    try {
      if (editingId) {
        await client.patch(endpoints.admin.eventDetail(editingId), payload);
        toast.success(t("adminPages.events.updated"));
      } else {
        await client.post(endpoints.admin.events, payload);
        toast.success(t("adminPages.events.created"));
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.events.saveFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (ev) => {
    try {
      await client.patch(endpoints.admin.eventDetail(ev.id), { isActive: !ev.isActive });
      toast.success(t("adminPages.events.statusToggled"));
      fetchEvents();
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.events.toggleFailed")));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await client.delete(endpoints.admin.eventDetail(deleteTarget.id));
      toast.success(t("adminPages.events.deleted"));
      setDeleteTarget(null);
      fetchEvents();
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.events.deleteFailed")));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={t("adminPages.events.title")}
          subtitle={t("adminPages.events.subtitle")}
        />
        <button
          onClick={handleOpenCreate}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[var(--yu-blue-700)] px-5 text-sm font-bold text-white shadow-lg shadow-[var(--yu-blue-700)]/20 hover:bg-orange-600 transition"
        >
          <Plus className="h-4 w-4" />
          {t("adminPages.events.addNew")}
        </button>
      </div>

      {/* Grid List View */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--yu-blue-700)]" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:bg-[#1A1A22] dark:border-white/8">
          <HelpCircle className="h-12 w-12 text-slate-350" />
          <p className="font-semibold text-slate-500">{t("adminPages.events.empty")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-start">{t("adminPages.events.table.title")}</th>
                  <th className="px-6 py-4 text-start">{t("adminPages.events.table.date")}</th>
                  <th className="px-6 py-4 text-start">{t("adminPages.events.table.location")}</th>
                  <th className="px-6 py-4 text-start">{t("adminPages.events.table.active")}</th>
                  <th className="px-6 py-4 text-end">{t("adminPages.events.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {events.map((ev) => {
                  const isOnline = ev.location?.startsWith("http://") || ev.location?.startsWith("https://");
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/40 dark:hover:bg-white/1">
                      <td className="px-6 py-4 max-w-sm">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{ev.titleAr}</div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ev.titleEn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-350 text-xs">
                        <div className="font-semibold">
                          {new Date(ev.eventDate).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                        </div>
                        <div className="text-[10px] text-slate-450 mt-0.5">
                          {new Date(ev.eventDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <span className="flex items-center gap-1 text-xs text-slate-650 dark:text-slate-350 line-clamp-1">
                          {isOnline ? <Video className="h-3.5 w-3.5 text-blue-500" /> : <MapPin className="h-3.5 w-3.5 text-amber-500" />}
                          <span className="truncate">{ev.location}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(ev)}
                          className="focus:outline-none"
                          title={t("adminPages.events.toggleActive")}
                        >
                          {ev.isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle className="h-3 w-3" />
                              {t("adminPages.events.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-500">
                              {t("adminPages.events.inactive")}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(ev)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-blue-600"
                            title={t("adminPages.events.edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(ev)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-red-500"
                            title={t("adminPages.events.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A22]" style={{ maxHeight: "95vh", overflowY: "auto" }}>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId
                  ? t("adminPages.events.modalEdit")
                  : t("adminPages.events.modalCreate")}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Title Arabic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {t("adminPages.events.titleAr")} *
                </label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className={inputFieldClass}
                  placeholder={t("adminPages.events.titleArPlaceholder")}
                />
              </div>

              {/* Title English */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {t("adminPages.events.titleEn")} *
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className={inputFieldClass}
                  placeholder="e.g. Smart Structures Seminar"
                />
              </div>

              {/* Description Arabic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {t("adminPages.events.descAr")} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className={textAreaClass}
                  placeholder={t("adminPages.events.descArPlaceholder")}
                />
              </div>

              {/* Description English */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {t("adminPages.events.descEn")} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className={textAreaClass}
                  placeholder={t("adminPages.events.descEnPlaceholder")}
                />
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                    {t("adminPages.events.eventDate")} *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={inputFieldClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                    {t("adminPages.events.location")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputFieldClass}
                    placeholder={t("adminPages.events.locationPlaceholder")}
                  />
                </div>
              </div>

              <ImageField
                label={t("adminPages.events.bannerUrl")}
                value={bannerUrl}
                onChange={setBannerUrl}
              />

              {/* Active Toggle Switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="ev-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-yu-blue-700 focus:ring-yu-blue-700/30 h-4 w-4"
                />
                <label htmlFor="ev-active" className="text-sm font-semibold text-slate-750 dark:text-slate-350 cursor-pointer">
                  {t("adminPages.events.publishNow")}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {t("adminPages.events.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--yu-blue-700)] px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("adminPages.events.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title={t("adminPages.events.deleteTitle")}
          description={t("adminPages.events.deleteConfirm", {
            title: isRtl ? deleteTarget.titleAr : deleteTarget.titleEn,
          })}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
