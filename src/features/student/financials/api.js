import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

/** Course lifetime purchase checkout (pending until admin approves). */
export async function postStudentCourseCheckout(courseId, body) {
  const res = await client.post(endpoints.student.financialsCheckoutCourse(courseId), body);
  return res?.data?.data ?? res?.data;
}

export async function postStudentPackageCheckout(packageId, body) {
  const res = await client.post(endpoints.student.financialsCheckoutPackage(packageId), body);
  return res?.data?.data ?? res?.data;
}

export async function uploadPaymentProof(file) {
  const formData = new FormData();
  formData.append("proof", file);
  const res = await client.post(endpoints.student.financialsPaymentProof, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data ?? res?.data;
}

/** Private session checkout for an availability slot. */
export async function postStudentPrivateCheckout(availabilityId, body) {
  const res = await client.post(endpoints.student.financialsCheckoutPrivate(availabilityId), body);
  return res?.data?.data ?? res?.data;
}

export async function fetchStudentMyCourses() {
  const res = await client.get(endpoints.student.financialsMyCourses);
  return res?.data?.data ?? [];
}

export async function validateStudentCoupon(body) {
  const res = await client.post(endpoints.student.couponValidate, body);
  return res?.data?.data ?? res?.data;
}

export async function fetchMyPayments() {
  const res = await client.get(endpoints.student.myPayments);
  return res?.data?.data ?? [];
}

/** Open student payment proof with auth (blob URL). */
export async function openMyPaymentProof(paymentId) {
  try {
    const res = await client.get(endpoints.student.myPaymentProof(paymentId), {
      responseType: "blob",
    });
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
    if (blob.type && blob.type.includes("application/json")) {
      const text = await blob.text();
      let message = "Could not open receipt";
      try {
        message = JSON.parse(text)?.message || message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return url;
  } catch (err) {
    const data = err?.response?.data;
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const json = JSON.parse(text);
        err.response.data = json;
      } catch {
        /* ignore */
      }
    }
    throw err;
  }
}
