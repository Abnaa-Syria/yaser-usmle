/**
 * Shared YouTube helpers for platform-branded lesson playback.
 * Note: YouTube ToS still shows limited branding once the iframe is playing;
 * the facade removes the YouTube chrome until the student presses play.
 */

export function extractYouTubeId(url) {
  const cleaned = String(url || "")
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g, "")
    .trim();
  return (
    cleaned.match(
      /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    )?.[1] || ""
  );
}

/** @param {string} videoId @param {{ autoplay?: boolean }} [options] */
export function buildYouTubeEmbedUrl(videoId, options = {}) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    playsinline: "1",
    fs: "1",
    cc_load_policy: "0",
    color: "white",
  });
  if (options.autoplay) {
    params.set("autoplay", "1");
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function youtubePosterCandidates(videoId) {
  return [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  ];
}
