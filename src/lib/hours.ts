export type BusinessHour = {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

export const DAY_NAMES = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

function toMinutes(t: string): number {
  const [h, m] = t.split(":");
  return Number(h) * 60 + Number(m ?? 0);
}

export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = (h ?? 0) < 12 ? "ص" : "م";
  const hour12 = (h ?? 0) % 12 === 0 ? 12 : (h ?? 0) % 12;
  return `${hour12}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

export type OpenState = {
  isOpen: boolean;
  label: string;
  today?: BusinessHour;
};

/** يحسب حالة المطعم من أوقات العمل المخزّنة في قاعدة البيانات (بتوقيت الرياض) */
export function getOpenState(hours: BusinessHour[], now = new Date()): OpenState {
  if (!hours.length) return { isOpen: false, label: "أوقات العمل غير محددة" };

  const riyadh = new Date(now.getTime() + (3 * 60 + now.getTimezoneOffset()) * 60000);
  const day = riyadh.getDay();
  const minutes = riyadh.getHours() * 60 + riyadh.getMinutes();
  const today = hours.find((h) => h.day_of_week === day);

  if (!today || today.is_closed) {
    return { isOpen: false, label: "مغلق اليوم", ...(today ? { today } : {}) };
  }

  const open = toMinutes(today.open_time);
  const close = toMinutes(today.close_time);

  if (minutes < open) {
    return { isOpen: false, label: `يفتح ${formatTime(today.open_time)}`, today };
  }
  if (minutes >= close) {
    return { isOpen: false, label: "مغلق الآن", today };
  }
  return { isOpen: true, label: `مفتوح حتى ${formatTime(today.close_time)}`, today };
}
