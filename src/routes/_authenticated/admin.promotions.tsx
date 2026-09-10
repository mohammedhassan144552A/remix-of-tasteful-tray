import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { allPromotionsQuery, type Promotion } from "@/lib/queries";
import type { Tables } from "@/integrations/supabase/types";
import { CURRENCY, money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/promotions")({
  head: () => ({ meta: [{ title: "العروض والكوبونات | مدة" }, { name: "robots", content: "noindex" }] }),
  component: AdminPromotions,
});

type Coupon = Tables<"coupons">;
const field = "mt-1 w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-saffron/60";

function AdminPromotions() {
  const queryClient = useQueryClient();
  const { data: promotions = [] } = useQuery(allPromotionsQuery);
  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Coupon[];
    },
  });
  const [promo, setPromo] = useState({ title: "", description: "", price: "", badge: "", image_url: "" });
  const [coupon, setCoupon] = useState({ code: "", discount_type: "percentage" as "percentage" | "fixed", discount_value: "10", min_order_total: "0", usage_limit: "" });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["promotions"] });
    void queryClient.invalidateQueries({ queryKey: ["coupons"] });
  }

  async function addPromotion(e: React.FormEvent) {
    e.preventDefault();
    if (!promo.title.trim()) return;
    const { error } = await supabase.from("promotions").insert({
      title: promo.title.trim(), description: promo.description.trim() || null,
      price: promo.price ? Number(promo.price) : null, badge: promo.badge.trim() || null,
      image_url: promo.image_url.trim() || null,
    });
    if (error) toast.error("تعذّر حفظ العرض");
    else { toast.success("تمت إضافة العرض"); setPromo({ title: "", description: "", price: "", badge: "", image_url: "" }); refresh(); }
  }

  async function addCoupon(e: React.FormEvent) {
    e.preventDefault();
    const code = coupon.code.trim().toUpperCase();
    if (!code || Number(coupon.discount_value) <= 0) return toast.error("أدخل كودًا وقيمة خصم صحيحة");
    const { error } = await supabase.from("coupons").insert({
      code, discount_type: coupon.discount_type, discount_value: Number(coupon.discount_value),
      min_order_total: Number(coupon.min_order_total) || 0,
      usage_limit: coupon.usage_limit ? Number(coupon.usage_limit) : null,
    });
    if (error) toast.error("تعذّر حفظ الكوبون — قد يكون الكود مستخدمًا");
    else { toast.success("تمت إضافة الكوبون"); setCoupon({ code: "", discount_type: "percentage", discount_value: "10", min_order_total: "0", usage_limit: "" }); refresh(); }
  }

  async function toggle(table: "promotions" | "coupons", row: Promotion | Coupon) {
    const { error } = await supabase.from(table).update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) toast.error("تعذّر التحديث"); else refresh();
  }

  async function remove(table: "promotions" | "coupons", id: string, label: string) {
    if (!confirm(`حذف «${label}»؟`)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast.error("تعذّر الحذف"); else { toast.success("تم الحذف"); refresh(); }
  }

  return <div>
    <h1 className="font-head text-2xl font-black">العروض والكوبونات</h1>
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-line bg-panel/70 p-5">
        <h2 className="font-head text-lg font-bold">إضافة عرض</h2>
        <form onSubmit={addPromotion} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-faint">العنوان<input required value={promo.title} onChange={e => setPromo({...promo,title:e.target.value})} className={field}/></label>
          <label className="text-xs text-faint">السعر ({CURRENCY})<input inputMode="decimal" value={promo.price} onChange={e => setPromo({...promo,price:e.target.value})} className={field}/></label>
          <label className="text-xs text-faint">الشارة<input value={promo.badge} onChange={e => setPromo({...promo,badge:e.target.value})} className={field}/></label>
          <label className="text-xs text-faint">رابط الصورة<input dir="ltr" value={promo.image_url} onChange={e => setPromo({...promo,image_url:e.target.value})} className={field}/></label>
          <label className="text-xs text-faint sm:col-span-2">الوصف<textarea rows={2} value={promo.description} onChange={e => setPromo({...promo,description:e.target.value})} className={field}/></label>
          <Button className="w-fit gradient-warm text-ink">إضافة العرض</Button>
        </form>
      </section>
      <section className="rounded-2xl border border-line bg-panel/70 p-5">
        <h2 className="font-head text-lg font-bold">إضافة كوبون</h2>
        <form onSubmit={addCoupon} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-faint">الكود<input required dir="ltr" value={coupon.code} onChange={e => setCoupon({...coupon,code:e.target.value})} className={field}/></label>
          <label className="text-xs text-faint">نوع الخصم<select value={coupon.discount_type} onChange={e => setCoupon({...coupon,discount_type:e.target.value as "percentage"|"fixed"})} className={field}><option value="percentage">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option></select></label>
          <label className="text-xs text-faint">قيمة الخصم<input required inputMode="decimal" value={coupon.discount_value} onChange={e => setCoupon({...coupon,discount_value:e.target.value})} className={field}/></label>
          <label className="text-xs text-faint">الحد الأدنى للطلب<input inputMode="decimal" value={coupon.min_order_total} onChange={e => setCoupon({...coupon,min_order_total:e.target.value})} className={field}/></label>
          <label className="text-xs text-faint">حد الاستخدام<input inputMode="numeric" placeholder="بلا حد" value={coupon.usage_limit} onChange={e => setCoupon({...coupon,usage_limit:e.target.value})} className={field}/></label>
          <div className="self-end"><Button className="gradient-warm text-ink">إضافة الكوبون</Button></div>
        </form>
      </section>
    </div>
    <section className="mt-7"><h2 className="font-head text-lg font-bold">العروض الحالية</h2><div className="mt-3 grid gap-2">
      {promotions.map(p => <article key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel/70 p-4"><div className="flex-1"><p className="font-bold">{p.title}</p><p className="text-xs text-faint">{p.price ? `${money(p.price)} ${CURRENCY}` : "من دون سعر"}</p></div><Button size="sm" variant="outline" onClick={() => toggle("promotions",p)}>{p.is_active ? "مفعّل" : "متوقف"}</Button><Button size="sm" variant="destructive" onClick={() => remove("promotions",p.id,p.title)}>حذف</Button></article>)}
    </div></section>
    <section className="mt-7"><h2 className="font-head text-lg font-bold">الكوبونات</h2><div className="mt-3 grid gap-2">
      {coupons.map(c => <article key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel/70 p-4"><div className="flex-1"><p dir="ltr" className="text-right font-bold">{c.code}</p><p className="text-xs text-faint">خصم {money(c.discount_value)}{c.discount_type === "percentage" ? "%" : ` ${CURRENCY}`} · استُخدم {c.used_count} مرة</p></div><Button size="sm" variant="outline" onClick={() => toggle("coupons",c)}>{c.is_active ? "مفعّل" : "متوقف"}</Button><Button size="sm" variant="destructive" onClick={() => remove("coupons",c.id,c.code)}>حذف</Button></article>)}
    </div></section>
  </div>;
}