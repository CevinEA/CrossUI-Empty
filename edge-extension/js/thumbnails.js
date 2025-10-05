// Simple thumbnail utility that draws current frame to canvas.
// For production, pre-generate vtt sprites; here we approximate.
export function drawThumbnailFromVideo(video, canvas) {
  const ctx = canvas.getContext('2d');
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } catch {}
}
