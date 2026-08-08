import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquare, Plus } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import {
  StudentBadge,
  StudentSurface,
  studentBtnPrimary,
  studentFieldClass,
  studentSelectClass,
} from "../../components/student/ui";
import { useCreateTicket, useMyTickets } from "../../features/student/tickets/hooks";
import { getErrorMessage } from "../../api/error";

const STATUS_TONE = {
  OPEN: "blue",
  IN_PROGRESS: "amber",
  RESOLVED: "emerald",
  CLOSED: "slate",
};

export default function Tickets() {
  const { t } = useTranslation();
  const { data: tickets = [], isLoading, isError, error, refetch } = useMyTickets();
  const createTicket = useCreateTicket();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [formErr, setFormErr] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormErr("");
    try {
      await createTicket.mutateAsync({ subject, description, priority });
      setSubject("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setFormErr(getErrorMessage(err, t("student.tickets.createError", { defaultValue: "Could not create ticket." })));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("student.tickets.title", { defaultValue: "Support" })}
        subtitle={t("student.tickets.subtitle", { defaultValue: "Open a ticket and our team will get back to you." })}
        actions={
          <button type="button" onClick={() => setShowForm((v) => !v)} className={studentBtnPrimary}>
            <Plus className="h-4 w-4" />
            {t("student.tickets.new", { defaultValue: "New ticket" })}
          </button>
        }
      />

      {showForm ? (
        <StudentSurface as="form" onSubmit={(e) => void handleCreate(e)} className="space-y-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            minLength={3}
            placeholder={t("student.tickets.subjectPlaceholder", { defaultValue: "Subject" })}
            className={studentFieldClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            rows={4}
            placeholder={t("student.tickets.descriptionPlaceholder", { defaultValue: "Describe your issue…" })}
            className={studentFieldClass}
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={studentSelectClass}>
            <option value="LOW">{t("student.tickets.priority.low", { defaultValue: "Low" })}</option>
            <option value="MEDIUM">{t("student.tickets.priority.medium", { defaultValue: "Medium" })}</option>
            <option value="HIGH">{t("student.tickets.priority.high", { defaultValue: "High" })}</option>
            <option value="URGENT">{t("student.tickets.priority.urgent", { defaultValue: "Urgent" })}</option>
          </select>
          {formErr ? <p className="text-sm text-rose-600 dark:text-rose-400">{formErr}</p> : null}
          <button type="submit" disabled={createTicket.isPending} className={studentBtnPrimary}>
            {t("student.tickets.submit", { defaultValue: "Submit ticket" })}
          </button>
        </StudentSurface>
      ) : null}

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <EmptyState
          title={t("student.tickets.loadError", { defaultValue: "Could not load tickets." })}
          message={getErrorMessage(error, t("student.tickets.loadError", { defaultValue: "Could not load tickets." }))}
          icon={MessageSquare}
          action={
            <button type="button" onClick={() => void refetch()} className={studentBtnPrimary}>
              {t("takeExam.retry")}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && tickets.length === 0 ? (
        <EmptyState
          title={t("student.tickets.empty", { defaultValue: "No support tickets yet." })}
          message={t("student.tickets.subtitle", { defaultValue: "Open a ticket and our team will get back to you." })}
          icon={MessageSquare}
          action={
            <button type="button" onClick={() => setShowForm(true)} className={studentBtnPrimary}>
              <Plus className="h-4 w-4" />
              {t("student.tickets.new", { defaultValue: "New ticket" })}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && tickets.length > 0 ? (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                to={`/student/tickets/${ticket.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-slate-200/80 bg-white/90 px-5 py-4 shadow-[var(--shadow-sm)] backdrop-blur-sm transition hover:border-[var(--yu-blue-200)] dark:border-white/8 dark:bg-[#0F1E38]/85"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : ""}
                  </p>
                </div>
                <StudentBadge tone={STATUS_TONE[ticket.status] || STATUS_TONE.OPEN}>{ticket.status}</StudentBadge>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
