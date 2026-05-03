export function luhn(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export function isExpiryValid(val: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(val)) return false;
  const [mm, yy] = val.split("/").map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const expYear = 2000 + yy;
  const expMonth = mm; // 1-indexed
  return expYear > now.getFullYear() || (expYear === now.getFullYear() && expMonth >= now.getMonth() + 1);
}

/**
 * Returns the value as-is if it is an R2 key or a base64 string under 15 MB.
 * Strips (returns null) anything over 15 MB to stay within server limits.
 */
export function safeImgVal(v: string | null): string | null {
  if (!v) return null;
  if (!v.startsWith("data:")) return v; // R2 key — always safe
  // base64 chars ≈ 4/3 of binary bytes; 15 MB binary ≈ 20,971,520 base64 chars
  const base64Part = v.indexOf(",") > -1 ? v.slice(v.indexOf(",") + 1) : v;
  return base64Part.length > 20_971_520 ? null : v;
}

/**
 * Resizes an image so neither dimension exceeds 4096 px, then encodes as
 * JPEG at 92% quality. This preserves high detail while staying within the
 * 15 MB per-image limit.
 */
export async function compressImage(file: File, maxPx = 4096, quality = 0.92): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const { width, height } = img;
        const scale = Math.min(1, maxPx / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(ev.target!.result as string); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
