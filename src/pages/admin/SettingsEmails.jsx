import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import {
  useAdminEmailTemplates,
  useCreateAdminEmailTemplate,
  useUpdateAdminEmailTemplate,
  usePreviewAdminEmailTemplate,
  useSendTestAdminEmailTemplate,
} from "../../features/admin/settings/hooks";
import { getErrorMessage } from "../../api/error";

function SettingsEmails() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useAdminEmailTemplates();
  const createMutation = useCreateAdminEmailTemplate();
  const updateMutation = useUpdateAdminEmailTemplate();
  const previewMutation = usePreviewAdminEmailTemplate();
  const sendTestMutation = useSendTestAdminEmailTemplate();
  const templates = data || [];
  const [selectedId, setSelectedId] = useState("");
  const selectedTemplate = templates.find((tpl) => tpl.id === selectedId) || templates[0];
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testTo, setTestTo] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const currentSubject = subject || selectedTemplate?.subject || "";
  const currentBody = body || selectedTemplate?.body || "";

  const save = () => {
    setStatusMessage("");
    if (selectedTemplate?.id) {
      updateMutation.mutate(
        { id: selectedTemplate.id, body: { subject: currentSubject, body: currentBody } },
        { onSuccess: () => setStatusMessage("Template saved.") }
      );
      return;
    }
    createMutation.mutate(
      { name: "New Template", subject: currentSubject || "Default subject line", body: currentBody || "Default template body content." },
      { onSuccess: () => setStatusMessage("Template created.") }
    );
  };

  const preview = () => {
    setStatusMessage("");
    previewMutation.mutate(
      {
        id: selectedTemplate?.id,
        subject: currentSubject,
        body: currentBody,
      },
      {
        onSuccess: (result) => {
          setPreviewSubject(result?.subject || "");
          setPreviewHtml(result?.html || "");
        },
        onError: (err) => setStatusMessage(getErrorMessage(err, "Preview failed.")),
      }
    );
  };

  const sendTest = () => {
    setStatusMessage("");
    if (!testTo.trim()) {
      setStatusMessage("Enter a recipient email for the test send.");
      return;
    }
    sendTestMutation.mutate(
      {
        id: selectedTemplate?.id,
        to: testTo.trim(),
        subject: currentSubject,
        body: currentBody,
      },
      {
        onSuccess: () => setStatusMessage("Test email sent."),
        onError: (err) => setStatusMessage(getErrorMessage(err, "Failed to send test email.")),
      }
    );
  };

  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.settingsEmails.title")} subtitle={t("adminPages.settingsEmails.subtitle")} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2 dark:border-white/8 dark:bg-[#1A1A22]">
          {isLoading ? <p className="text-sm text-slate-500">Loading templates...</p> : null}
          {isError ? (
            <p className="text-sm text-red-500">
              {getErrorMessage(error, "Failed to load templates.")}{" "}
              <button onClick={() => refetch()} className="underline">
                Retry
              </button>
            </p>
          ) : null}
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedId(tpl.id);
                setSubject(tpl.subject || "");
                setBody(tpl.body || "");
                setPreviewHtml("");
                setPreviewSubject("");
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                selectedTemplate?.id === tpl.id
                  ? "bg-[var(--yu-blue-700)]/10 text-[var(--yu-blue-700)] dark:bg-white/10 dark:text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <span>{tpl.name}</span>
              <span className="text-xs text-slate-500">{tpl.updatedAt ? new Date(tpl.updatedAt).toLocaleDateString() : "-"}</span>
            </button>
          ))}
        </div>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3 dark:border-white/8 dark:bg-[#1A1A22]">
          <input
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            placeholder={t("adminPages.settingsEmails.subject")}
            value={currentSubject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="min-h-64 w-full rounded-lg border border-slate-200 p-3 font-mono text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200"
            value={currentBody}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500 dark:border-white/10">
            {"{{student_name}} {{course_title}} {{reset_link}} {{otp_code}} {{app_name}}"}
          </div>
          <input
            type="email"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            placeholder="test@example.com"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={preview}
              disabled={previewMutation.isPending}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:text-slate-300"
            >
              {previewMutation.isPending ? "..." : t("adminPages.settingsEmails.preview")}
            </button>
            <button
              type="button"
              onClick={sendTest}
              disabled={sendTestMutation.isPending}
              className="rounded-lg border border-[var(--yu-blue-700)] px-3 py-2 text-sm text-[var(--yu-blue-700)] dark:text-white"
            >
              {sendTestMutation.isPending ? "..." : t("adminPages.settingsEmails.sendTest")}
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-[var(--yu-blue-700)] px-3 py-2 text-sm font-bold text-white"
            >
              {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
          {statusMessage ? <p className="text-sm text-slate-600 dark:text-slate-300">{statusMessage}</p> : null}
          {previewHtml ? (
            <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{previewSubject}</p>
              <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default SettingsEmails;
