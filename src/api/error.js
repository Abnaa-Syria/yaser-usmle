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
  return error?.response?.data?.code || error?.code || null;
}

export function getErrorDetails(error) {
  return error?.response?.data?.details ?? null;
}

export function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? null;
}
