import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { zonesQuery, type DeliveryZone } from "@/lib/queries";
import { CURRENCY } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/zones")({
  component: AdminZones,
});

function AdminZones() {
  const queryClient = useQueryClient();
  const { data: zones = [] } = useQuery(zonesQuery);
  const [name, setName] = useState("");
  const [fee, setFee] = useState("15");
  const [minTotal, setMinTotal] = useState("0");
  const [eta, setEta] = useState("40");

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["delivery_zones"] });
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("delivery_zones").insert({
      name: name.trim(),
      delivery_fee: Number(fee) || 0,
      min_order_total: Number(minTotal) || 0,
      eta_minutes: Number(eta) || 30,
    });
    if (error) toast.error("تعذّرت الإضافة");
    else {
      toast.success("تمت إضافة المنطقة");
      setName("");
      refresh();
    }
  }

  async function update(zone: DeliveryZone, patch: Partial<DeliveryZone>) {
    const { error } = await supabase.from("delivery_zones").update(patch).eq("id", zone.id);
    if (error) toast.error("تعذّر التحديث");
    else refresh();
  }

  async function remove(zone: DeliveryZone) {
    if (!confirm(`حذف منطقة "${zone.name}"؟`)) return;
    const { error } = await supabase.from("delivery_zones").delete().eq("id", zone.id);
    if (error) toast.error("تعذّر الحذف");
    else refresh();
  }

  const field =
    "mt-1 w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-saffron/60";

  return (
    <div>
      <h1 className="font-head text-2xl font-black">مناطق التوصيل</h1>

      <form onSubmit={add} className="mt-5 rounded-2xl border border-line bg-panel/70 p-5">
        <h2 className="font-head text-lg font-bold">إضافة منطقة</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <label className="text-xs text-faint">
            الاسم
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} className={field} />
          </label>
          <label className="text-xs text-faint">
            رسوم التوصيل ({CURRENCY})
            <input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="decimal" className={field} />
          </label>
          <label className="text-xs text-faint">
            الحد الأدنى للطلب
            <input
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              inputMode="decimal"
              className={field}
            />
          </label>
          <label className="text-xs text-faint">
            مدة التوصيل (دقيقة)
            <input value={eta} onChange={(e) => setEta(e.target.value)} inputMode="numeric" className={field} />
          </label>
        </div>
        <button className="mt-4 rounded-xl gradient-warm px-5 py-2.5 font-head text-sm font-bold text-ink">
          إضافة
        </button>
      </form>

      <div className="mt-6 grid gap-2">
        {zones.map((z) => (
          <article
            key={z.id}
            className="grid gap-3 rounded-xl border border-line bg-panel/70 p-4 sm:grid-cols-[1fr_auto]"
          >
            <div className="grid gap-3 sm:grid-cols-4">
              <input
                defaultValue={z.name}
                onBlur={(e) => e.target.value !== z.name && update(z, { name: e.target.value })}
                className="rounded-lg border border-line bg-panel px-3 py-2 text-sm"
              />
              <input
                defaultValue={String(z.delivery_fee)}
                onBlur={(e) => update(z, { delivery_fee: Number(e.target.value) || 0 })}
                className="rounded-lg border border-line bg-panel px-3 py-2 text-sm"
              />
              <input
                defaultValue={String(z.min_order_total)}
                onBlur={(e) => update(z, { min_order_total: Number(e.target.value) || 0 })}
                className="rounded-lg border border-line bg-panel px-3 py-2 text-sm"
              />
              <input
                defaultValue={String(z.eta_minutes)}
                onBlur={(e) => update(z, { eta_minutes: Number(e.target.value) || 30 })}
                className="rounded-lg border border-line bg-panel px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => update(z, { is_active: !z.is_active })}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  z.is_active ? "border-mint/50 bg-mint/10 text-mint" : "border-line text-faint"
                }`}
              >
                {z.is_active ? "مفعّلة" : "متوقفة"}
              </button>
              <button
                onClick={() => remove(z)}
                className="rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive"
              >
                حذف
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
