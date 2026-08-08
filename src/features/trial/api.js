import client from "../../api/client";
import useTrialStore from "../../store/trialStore";
import { getDeviceFingerprint, getDeviceMetadata } from "../../utils/deviceFingerprint";

async function withDevicePayload() {
  const fingerprint = await getDeviceFingerprint();
  const meta = getDeviceMetadata();
  return { fingerprint, ...meta };
}

export async function fetchPublicTrialConfig() {
  const response = await client.get("/public/trial", { skip403Redirect: true });
  return response?.data?.data || null;
}

export async function startPublicTrial() {
  const device = await withDevicePayload();
  const response = await client.post(
    "/public/trial/start",
    {
      fingerprint: device.fingerprint,
      deviceName: device.deviceName,
      os: device.os,
    },
    {
      skip403Redirect: true,
      headers: { "X-Device-Fingerprint": device.fingerprint },
    }
  );
  const data = response?.data?.data;
  if (data?.accessToken) {
    useTrialStore.getState().setSession({
      accessToken: data.accessToken,
      trialId: data.trialId,
      startedAt: data.startedAt,
      expiresAt: data.expiresAt,
      status: data.status,
      remainingMs: data.remainingMs,
    });
  }
  return data;
}

export async function fetchTrialMe() {
  const fingerprint = await getDeviceFingerprint();
  const response = await client.get("/trial/me", {
    skip403Redirect: true,
    headers: { "X-Device-Fingerprint": fingerprint },
  });
  const data = response?.data?.data || null;
  if (data?.expiresAt) {
    useTrialStore.getState().setSession({
      accessToken: useTrialStore.getState().accessToken,
      trialId: data.trialId,
      startedAt: data.startedAt,
      expiresAt: data.expiresAt,
      status: data.status,
      remainingMs: data.remainingMs,
    });
  }
  return data;
}

export async function fetchTrialCourses() {
  const fingerprint = await getDeviceFingerprint();
  const response = await client.get("/trial/courses", {
    skip403Redirect: true,
    headers: { "X-Device-Fingerprint": fingerprint },
  });
  return response?.data?.data?.courses || [];
}

export async function fetchTrialCourseUnits(courseId) {
  const fingerprint = await getDeviceFingerprint();
  const response = await client.get(`/trial/courses/${courseId}/units`, {
    skip403Redirect: true,
    headers: { "X-Device-Fingerprint": fingerprint },
  });
  return response?.data?.data || [];
}

export async function fetchTrialLessonPlayback(lessonId) {
  const fingerprint = await getDeviceFingerprint();
  const response = await client.get(`/trial/lessons/${lessonId}/playback`, {
    skip403Redirect: true,
    headers: { "X-Device-Fingerprint": fingerprint },
  });
  return response?.data?.data || null;
}

export async function fetchTrialRecordings() {
  const fingerprint = await getDeviceFingerprint();
  const response = await client.get("/trial/recordings", {
    skip403Redirect: true,
    headers: { "X-Device-Fingerprint": fingerprint },
  });
  return response?.data?.data?.recordings || [];
}
