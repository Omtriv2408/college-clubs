// CLIENT-SIDE WEBP CONVERSION (browser only).
// Steps: read file -> draw on a <canvas> (scaled down to max 800px wide) -> export as WebP blob.
// This runs BEFORE upload, so only the small .webp ever reaches Supabase.
export function convertToWebP(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width); // never upscale
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("WebP conversion failed"))), "image/webp", quality);
    };
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = url;
  });
}
