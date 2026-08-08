export function getErrorMessage(error, fallback = "Something went wrong") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? null;
}
