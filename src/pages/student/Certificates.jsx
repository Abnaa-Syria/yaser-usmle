import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Award, Download, ExternalLink, Loader2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import {
  StudentSurface,
  studentBtnGhost,
  studentBtnPrimary,
} from "../../components/student/ui";
import { useClaimCertificate, useDownloadStudentCertificate, useMyCertificates } from "../../features/student/certificates/hooks";
import { useMyCourses } from "../../features/student/courses/hooks";
import { getErrorMessage } from "../../api/error";
import { downloadBlob, openCertificateDownloadUrl } from "../../utils/certificate";

export default function Certificates() {
  const { t } = useTranslation();
  const { data: certificates = [], isLoading, isError, error, refetch } = useMyCertificates();
  const { data: courses = [] } = useMyCourses();
  const claim = useClaimCertificate();
  const download = useDownloadStudentCertificate();
  const [claimErr, setClaimErr] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadErr, setDownloadErr] = useState("");

  const completedWithoutCert = courses.filter(
    (c) => c.isCompleted && !certificates.some((cert) => cert.courseId === c.id || cert.courseId === c.courseId)
  );

  const handleClaim = async (courseId) => {
    setClaimErr("");
    setClaimingId(courseId);
    try {
      const blob = await claim.mutateAsync(courseId);
      downloadBlob(blob, `certificate-${courseId}.pdf`);
    } catch (e) {
      setClaimErr(getErrorMessage(e, t("student.certificates.claimError", { defaultValue: "Could not claim certificate." })));
    } finally {
      setClaimingId(null);
    }
  };

  const handleDownload = async (cert) => {
    setDownloadErr("");
    setDownloadingId(cert.id);
    try {
      const blob = await download.mutateAsync(cert.id);
      downloadBlob(blob, `certificate-${cert.serialNumber}.pdf`);
    } catch (e) {
      setDownloadErr(getErrorMessage(e, t("student.certificates.downloadError", { defaultValue: "Could not download certificate." })));
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePublicDownload = (cert) => {
    const path = cert.links?.publicDownloadPath;
    if (path) openCertificateDownloadUrl(path);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("student.certificates.title", { defaultValue: "Certificates" })}
        subtitle={t("student.certificates.subtitle", { defaultValue: "Download certificates for completed courses." })}
      />

      {claimErr ? <p className="text-sm text-rose-600 dark:text-rose-400">{claimErr}</p> : null}
      {downloadErr ? <p className="text-sm text-rose-600 dark:text-rose-400">{downloadErr}</p> : null}

      {completedWithoutCert.length > 0 ? (
        <StudentSurface className="border-[var(--yu-blue-200)]/80 bg-[var(--yu-blue-50)]/40 dark:border-[var(--yu-blue-800)]/40 dark:bg-[var(--yu-blue-700)]/8">
          <h2 className="text-sm font-black text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-300)]">
            {t("student.certificates.readyToClaim", { defaultValue: "Ready to claim" })}
          </h2>
          <ul className="mt-3 space-y-2">
            {completedWithoutCert.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/8 dark:bg-[#0C1829]"
              >
                <span className="font-bold text-slate-900 dark:text-white">{c.title}</span>
                <button
                  type="button"
                  disabled={claimingId === c.id}
                  onClick={() => void handleClaim(c.id)}
                  className={studentBtnPrimary}
                >
                  {claimingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {t("student.certificates.claim", { defaultValue: "Claim PDF" })}
                </button>
              </li>
            ))}
          </ul>
        </StudentSurface>
      ) : null}

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <EmptyState
          title={t("student.certificates.loadError", { defaultValue: "Could not load certificates." })}
          message={getErrorMessage(error, t("student.certificates.loadError", { defaultValue: "Could not load certificates." }))}
          icon={Award}
          action={
            <button type="button" onClick={() => void refetch()} className={studentBtnPrimary}>
              {t("takeExam.retry")}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && certificates.length === 0 && completedWithoutCert.length === 0 ? (
        <EmptyState
          title={t("student.certificates.empty", { defaultValue: "Complete a course to earn your first certificate." })}
          message={t("student.certificates.subtitle", { defaultValue: "Download certificates for completed courses." })}
          icon={Award}
        />
      ) : null}

      {!isLoading && !isError && certificates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <StudentSurface key={cert.id} className="flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--yu-blue-700)]/12 to-[var(--yu-blue-500)]/5 text-[var(--yu-blue-700)] dark:text-[var(--yu-blue-400)]">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-black tracking-tight text-slate-900 dark:text-white">{cert.course?.title || cert.title}</h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {t("student.certificates.issued", { defaultValue: "Issued" })}:{" "}
                {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "—"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-400">{cert.serialNumber}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={downloadingId === cert.id}
                  onClick={() => void handleDownload(cert)}
                  className={`${studentBtnPrimary} px-3 py-1.5 text-xs`}
                >
                  {downloadingId === cert.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  {t("student.certificates.download", { defaultValue: "Download PDF" })}
                </button>
                {cert.links?.verifyUrl ? (
                  <Link to={cert.links.verifyUrl} className={`${studentBtnGhost} px-3 py-1.5 text-xs`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("student.certificates.verifyLink", { defaultValue: "Verify link" })}
                  </Link>
                ) : null}
                {cert.links?.publicDownloadPath ? (
                  <button type="button" onClick={() => handlePublicDownload(cert)} className={`${studentBtnGhost} px-3 py-1.5 text-xs`}>
                    {t("student.certificates.shareDownload", { defaultValue: "Shareable download" })}
                  </button>
                ) : null}
              </div>
            </StudentSurface>
          ))}
        </div>
      ) : null}
    </div>
  );
}
