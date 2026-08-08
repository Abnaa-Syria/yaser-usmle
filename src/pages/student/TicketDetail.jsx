import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, MessageSquare, Send } from "lucide-react";
import EmptyState from "../../components/dashboard/EmptyState";
import {
  StudentBadge,
  StudentSurface,
  studentBtnGhost,
  studentBtnPrimary,
  studentFieldClass,
} from "../../components/student/ui";
import { useMyTickets, useReplyTicket } from "../../features/student/tickets/hooks";
import { getErrorMessage } from "../../api/error";

const STATUS_TONE = {
  OPEN: "blue",
  IN_PROGRESS: "amber",
  RESOLVED: "emerald",
  CLOSED: "slate",
};

const PRIORITY_TONE = {
  LOW: "slate",
  MEDIUM: "blue",
  HIGH: "amber",
  URGENT: "rose",
};

export default function TicketDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: tickets = [], isLoading } = useMyTickets();
  const reply = useReplyTicket();
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  const ticket = useMemo(() => tickets.find((tk) => tk.id === id), [tickets, id]);
  const messages = ticket?.messages ?? [];

  const handleReply = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !id) return;
    setErr("");
    try {
      await reply.mutateAsync({ ticketId: id, message: text });
      setMessage("");
    } catch (e2) {
      setErr(getErrorMessage(e2, t("student.tickets.replyError", { defaultValue: "Could not send reply." })));
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>;
  }

  if (!ticket) {
    return (
      <EmptyState
        title={t("student.tickets.notFound", { defaultValue: "Ticket not found." })}
        message={t("student.tickets.back", { defaultValue: "Back to tickets" })}
        icon={MessageSquare}
        action={
          <Link to="/student/tickets" className={studentBtnGhost}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("student.tickets.back", { defaultValue: "Back to tickets" })}
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/student/tickets"
        className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 transition hover:text-[var(--yu-blue-700)] dark:hover:text-[var(--yu-blue-400)]"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("student.tickets.back", { defaultValue: "Back to tickets" })}
      </Link>

      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{ticket.subject}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("student.tickets.statusLabel", { defaultValue: "Status" })}
          </span>
          <StudentBadge tone={STATUS_TONE[ticket.status] || STATUS_TONE.OPEN}>{ticket.status}</StudentBadge>
          <StudentBadge tone={PRIORITY_TONE[ticket.priority] || "blue"}>{ticket.priority}</StudentBadge>
        </div>
      </div>

      <StudentSurface className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">{t("student.tickets.noMessages", { defaultValue: "No messages yet." })}</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-white/8 dark:bg-[#0C1829]"
            >
              <p className="text-sm text-slate-800 dark:text-slate-200">{msg.message}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
              </p>
            </div>
          ))
        )}
      </StudentSurface>

      {ticket.status !== "CLOSED" ? (
        <StudentSurface as="form" onSubmit={(e) => void handleReply(e)} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder={t("student.tickets.replyPlaceholder", { defaultValue: "Write a reply…" })}
            className={studentFieldClass}
          />
          {err ? <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p> : null}
          <button type="submit" disabled={reply.isPending || !message.trim()} className={studentBtnPrimary}>
            {reply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("student.tickets.sendReply", { defaultValue: "Send reply" })}
          </button>
        </StudentSurface>
      ) : null}
    </div>
  );
}
