export const CURRENCY = "ر.س";

export function money(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** رقم جوال سعودي: 05XXXXXXXX أو 5XXXXXXXX أو +9665XXXXXXXX */
export function normalizeSaudiPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  let local = digits;
  if (local.startsWith("00966")) local = local.slice(5);
  else if (local.startsWith("966")) local = local.slice(3);
  if (local.startsWith("0")) local = local.slice(1);
  if (!/^5\d{8}$/.test(local)) return null;
  return `0${local}`;
}

export function isValidMapUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google)/i.test(
      u.hostname + u.pathname,
    );
  } catch {
    return false;
  }
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  received: "تم استلام الطلب",
  preparing: "قيد التجهيز",
  ready: "جاهز",
  out_for_delivery: "خرج للتوصيل",
  delivered: "تم التسليم",
  picked_up: "تم الاستلام",
  cancelled: "ملغي",
};

export const ORDER_STATUS_FLOW = [
  "received",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
] as const;
