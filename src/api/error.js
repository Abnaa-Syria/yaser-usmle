const PAYLOAD_TOO_LARGE_AR =
  "محتوى المقالة كبير جداً. قصّر النص أو استخدم روابط للصور بدلاً من لصقها مباشرة.";

export function getErrorMessage(error, fallback = "Something went wrong") {
  const status = error?.response?.status;
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  if (status === 413 || /entity too large|payload too large/i.test(String(message || ""))) {
    return PAYLOAD_TOO_LARGE_AR;
  }

  return message || fallback;
}

export function getErrorCode(error) {
  const data = error?.response?.data;
  return data?.code || data?.error?.code || error?.code || null;
}

export function getErrorDetails(error) {
  const data = error?.response?.data;
  return data?.details ?? data?.error?.details ?? data?.data?.details ?? null;
}

/** True when login blocked due to trusted-device policy. */
export function isDeviceAccessError(error) {
  const code = String(getErrorCode(error) || "");
  if (code === "DEVICE_LIMIT" || code === "DEVICE_NOT_TRUSTED") return true;
  const msg = String(getErrorMessage(error, "") || "").toLowerCase();
  return (
    msg.includes("device limit") ||
    msg.includes("not trusted") ||
    msg.includes("trusted devices") ||
    msg.includes("device replacement")
  );
}

export function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? null;
}
