import { useState } from "react";
import toast from "react-hot-toast";
import { useInstructorApplications, useUpdateInstructorApplication } from "../../features/admin/instructorApplications/hooks";
import { getErrorMessage } from "../../api/error";

const STATUSES = ["NEW", "REVIEWING", "ACCEPTED", "REJECTED", "ARCHIVED"];

export default function AdminInstructorApplications() {
  const [status, setStatus] = useState("");
  const [notesById, setNotesById] = useState({});
  const { data: applications = [], isLoading, isError, refetch } = useInstructorApplications(status ? { status } : {});
  const updateApplication = useUpdateInstructorApplication();

  const update = async (application, nextStatus) => {
    try {
      await updateApplication.mutateAsync({
        id: application.id,
        body: {
          status: nextStatus,
          adminNotes: notesById[application.id] ?? application.adminNotes ?? "",
        },
      });
      toast.success("Application updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update application."));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Instructor Applications</h1>
        <p className="mt-1 text-sm text-slate-500">Review Join Us leads without granting automatic instructor privileges.</p>
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button type="button" onClick={() => refetch()} className="rounded-xl border px-3 py-2 text-sm font-semibold">Refresh</button>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {isError ? <p className="text-sm text-red-600">Could not load instructor applications.</p> : null}

      <div className="grid gap-4">
        {applications.length ? (
          applications.map((application) => (
            <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{application.name}</h2>
                  <p className="text-sm text-slate-500">{application.email} · {application.phone || "No phone"}</p>
                  <p className="mt-2 text-sm"><span className="font-semibold">Specialty:</span> {application.specialty || "—"}</p>
                  <p className="mt-1 text-sm"><span className="font-semibold">Experience:</span> {application.experience || "—"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{application.status}</span>
              </div>
              {application.message ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{application.message}</p> : null}
              {application.documentUrl ? (
                <a href={application.documentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-yu-blue-700 hover:underline">
                  Open document
                </a>
              ) : null}
              <textarea
                value={notesById[application.id] ?? application.adminNotes ?? ""}
                onChange={(e) => setNotesById((current) => ({ ...current, [application.id]: e.target.value }))}
                rows={3}
                className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Admin notes"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {STATUSES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={updateApplication.isPending || application.status === item}
                    onClick={() => update(application, item)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No applications found.</div>
        )}
      </div>
    </div>
  );
}
