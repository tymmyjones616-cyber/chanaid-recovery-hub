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
