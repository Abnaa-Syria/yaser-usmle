import { useQuery } from "@tanstack/react-query";
import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

/**
 * @typedef {{
 *   provider: 'vdocipher' | 'youtube' | 'url';
 *   lessonId: string;
 *   embedUrl: string;
 *   otp?: string;
 *   playbackInfo?: string;
 *   url?: string;
 *   videoId?: string;
 *   posterUrl?: string;
 * }} LessonPlayback
 */

/** @param {string} lessonId */
export async function fetchLessonPlayback(lessonId) {
  const res = await client.get(endpoints.student.lessonPlayback(lessonId));
  return /** @type {LessonPlayback | null} */ (res?.data?.data ?? null);
}

/** @param {string | undefined | null} lessonId @param {{ enabled?: boolean }} [options] */
export function useLessonPlayback(lessonId, options = {}) {
  const enabled = options.enabled !== false && Boolean(lessonId);
  return useQuery({
    queryKey: ["student", "lesson-playback", lessonId],
    queryFn: () => fetchLessonPlayback(lessonId),
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
}
