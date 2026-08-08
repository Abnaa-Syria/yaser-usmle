import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../api/client";
import { getErrorMessage } from "../api/error";

export default function VerifyEmail() {
  const { token } = useParams();
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [status, setStatus] = useState(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await client.post(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(isRtl ? "تم تفعيل البريد بنجاح." : "Email verified successfully.");
      } catch (err) {
        setStatus("error");
        setMessage(getErrorMessage(err, isRtl ? "رابط غير صالح أو منتهي." : "Invalid or expired link."));
      }
    })();
  }, [token, isRtl]);

  const resend = async () => {
    setStatus("sending");
    try {
      await client.post("/auth/resend-verification", { email });
      setStatus("sent");
      setMessage(isRtl ? "إن وُجد الحساب، سيتم إرسال رابط التفعيل." : "If the account exists, a verification link was sent.");
    } catch (err) {
      setStatus("error");
      setMessage(getErrorMessage(err, "Failed to resend."));
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">{isRtl ? "تفعيل البريد الإلكتروني" : "Verify your email"}</h1>
      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
      {status === "verifying" ? <p className="mt-4 text-sm text-slate-500">...</p> : null}
      {status === "success" ? (
        <Link to="/login" className="mt-6 rounded-xl bg-[var(--yu-blue-700)] px-4 py-3 text-center text-sm font-bold text-white">
          {isRtl ? "تسجيل الدخول" : "Sign in"}
        </Link>
      ) : (
        <div className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
          />
          <button
            type="button"
            onClick={resend}
            disabled={!email || status === "sending"}
            className="w-full rounded-xl bg-[var(--yu-blue-700)] py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {isRtl ? "إعادة إرسال رابط التفعيل" : "Resend verification link"}
          </button>
        </div>
      )}
    </div>
  );
}
