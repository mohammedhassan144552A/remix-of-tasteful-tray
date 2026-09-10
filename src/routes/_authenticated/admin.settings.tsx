import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { hoursQuery, settingsQuery, type BusinessHourRow } from "@/lib/queries";
import { DAY_NAMES } from "@/lib/hours";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "إعدادات المطعم | مدة" }, { name: "robots", content: "noindex" }] }),
  component: AdminSettings,
});

const field = "mt-1 w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-saffron/60";

function AdminSettings() {
  const client = useQueryClient();
  const { data: settings } = useQuery(settingsQuery);
  const { data: loadedHours = [] } = useQuery(hoursQuery);
  const [form, setForm] = useState({ name: "مدة", tagline: "", phone: "", whatsapp: "", email: "", address: "", hero_title: "", hero_subtitle: "", footer_text: "", prep_minutes: "25", min_order_total: "0", free_delivery_threshold: "" });
  const [hours, setHours] = useState<BusinessHourRow[]>([]);

  useEffect(() => { if (settings) setForm({ name: settings.name, tagline: settings.tagline ?? "", phone: settings.phone ?? "", whatsapp: settings.whatsapp ?? "", email: settings.email ?? "", address: settings.address ?? "", hero_title: settings.hero_title ?? "", hero_subtitle: settings.hero_subtitle ?? "", footer_text: settings.footer_text ?? "", prep_minutes: String(settings.prep_minutes), min_order_total: String(settings.min_order_total), free_delivery_threshold: settings.free_delivery_threshold == null ? "" : String(settings.free_delivery_threshold) }); }, [settings]);
  useEffect(() => setHours(loadedHours), [loadedHours]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("restaurant_settings").update({ ...form, prep_minutes: Number(form.prep_minutes) || 25, min_order_total: Number(form.min_order_total) || 0, free_delivery_threshold: form.free_delivery_threshold ? Number(form.free_delivery_threshold) : null }).eq("id", 1);
    if (error) toast.error("تعذّر حفظ الإعدادات"); else { toast.success("تم حفظ الإعدادات"); void client.invalidateQueries({queryKey:["settings"]}); }
  }

  async function saveHours() {
    const results = await Promise.all(hours.map(h => supabase.from("business_hours").update({ open_time: h.open_time, close_time: h.close_time, is_closed: h.is_closed }).eq("id",h.id)));
    if (results.some(r => r.error)) toast.error("تعذّر حفظ ساعات العمل"); else { toast.success("تم حفظ ساعات العمل"); void client.invalidateQueries({queryKey:["business_hours"]}); }
  }

  function updateHour(id: string, patch: Partial<BusinessHourRow>) { setHours(rows => rows.map(row => row.id === id ? {...row,...patch} : row)); }

  return <div><h1 className="font-head text-2xl font-black">إعدادات المطعم</h1>
    <form onSubmit={saveSettings} className="mt-5 rounded-2xl border border-line bg-panel/70 p-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-xs text-faint">اسم المطعم<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint">العبارة المختصرة<input value={form.tagline} onChange={e=>setForm({...form,tagline:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint">رقم الهاتف<input dir="ltr" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint">واتساب<input dir="ltr" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint">البريد الإلكتروني<input dir="ltr" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint">العنوان<input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint">مدة التجهيز بالدقائق<input inputMode="numeric" value={form.prep_minutes} onChange={e=>setForm({...form,prep_minutes:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint">الحد الأدنى للطلب<input inputMode="decimal" value={form.min_order_total} onChange={e=>setForm({...form,min_order_total:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint">حد التوصيل المجاني<input inputMode="decimal" value={form.free_delivery_threshold} onChange={e=>setForm({...form,free_delivery_threshold:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint sm:col-span-2 lg:col-span-3">العنوان الرئيسي<input value={form.hero_title} onChange={e=>setForm({...form,hero_title:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint sm:col-span-2 lg:col-span-3">النص التعريفي<textarea rows={2} value={form.hero_subtitle} onChange={e=>setForm({...form,hero_subtitle:e.target.value})} className={field}/></label>
      <label className="text-xs text-faint sm:col-span-2 lg:col-span-3">نص التذييل<input value={form.footer_text} onChange={e=>setForm({...form,footer_text:e.target.value})} className={field}/></label>
    </div><Button className="mt-4 gradient-warm text-ink">حفظ الإعدادات</Button></form>
    <section className="mt-7 rounded-2xl border border-line bg-panel/70 p-5"><h2 className="font-head text-lg font-bold">ساعات العمل</h2><div className="mt-4 grid gap-2">
      {hours.map(h => <div key={h.id} className="grid items-center gap-3 rounded-xl border border-line bg-background/40 p-3 sm:grid-cols-[100px_1fr_1fr_auto]"><span className="font-semibold">{DAY_NAMES[h.day_of_week]}</span><input type="time" value={h.open_time.slice(0,5)} disabled={h.is_closed} onChange={e=>updateHour(h.id,{open_time:e.target.value})} className={field}/><input type="time" value={h.close_time.slice(0,5)} disabled={h.is_closed} onChange={e=>updateHour(h.id,{close_time:e.target.value})} className={field}/><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={h.is_closed} onChange={e=>updateHour(h.id,{is_closed:e.target.checked})}/> مغلق</label></div>)}
    </div><Button onClick={saveHours} className="mt-4 gradient-warm text-ink">حفظ ساعات العمل</Button></section>
  </div>;
}