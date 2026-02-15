// FPS-relative timing helpers
// Converts 30fps frame numbers to current fps, maintaining real-time duration

/** Convert a 30fps frame number to current fps. At 30fps returns unchanged. */
export const f = (frame30: number, fps: number): number =>
  Math.round(frame30 * (fps / 30));

/** Convert seconds to frame count at given fps */
export const sec = (seconds: number, fps: number): number =>
  Math.round(seconds * fps);
