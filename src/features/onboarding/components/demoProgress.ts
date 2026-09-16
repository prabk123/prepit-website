export function startDemoProgressTracker(
  totalMs: number,
  onChanged?: (progress: number) => void,
): () => void {
  if (!onChanged || totalMs <= 0) return () => {};

  const started = performance.now();
  let frame = 0;
  let last = -1;

  const tick = (now: number) => {
    const progress = Math.min(1, (now - started) / totalMs);
    if (progress !== last) {
      last = progress;
      onChanged(progress);
    }
    if (progress < 1) frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
