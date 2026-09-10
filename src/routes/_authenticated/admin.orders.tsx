import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { money, CURRENCY, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

const STATUSES = [
  "new",
  "received",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "picked_up",
  "cancelled",
] as const;

type ExtraJson = { name?: string };

function AdminOrders() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("active");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    refetchInterval: 20_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-order-items", expanded],
    enabled: !!expanded,
    queryFn: async () => {
      const res = await supabase.from("order_items").select("*").eq("order_id", expanded!);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

  async function setStatus(id: string, status: (typeof STATUSES)[number]) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error("تعذّر تحديث الحالة");
    else {
      toast.success("تم التحديث");
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    }
  }

  const visible = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active") return !["delivered", "picked_up", "cancelled"].includes(o.status);
    return o.status === filter;
  });

  return (
    <div>
      <h1 className="font-head text-2xl font-black">الطلبات</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { key: "active", label: "قيد التنفيذ" },
          { key: "all", label: "الكل" },
          ...STATUSES.map((s) => ({ key: s, label: ORDER_STATUS_LABELS[s]! })),
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              filter === f.key
                ? "border-saffron bg-saffron text-ink"
                : "border-line bg-panel/70 text-soft"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        {visible.map((o) => (
          <article key={o.id} className="rounded-2xl border border-line bg-panel/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-head font-bold">
                  #{o.order_number} — {o.customer_name}
                </h2>
                <p className="mt-1 text-xs text-faint" dir="ltr">
                  {o.customer_phone}
                </p>
                <p className="mt-1 text-xs text-faint">
                  {formatDate(o.created_at)} ·{" "}
                  {o.fulfillment === "delivery"
                    ? `توصيل — ${o.delivery_zone_name ?? "—"}`
                    : "استلام من الفرع"}
                </p>
                {o.notes ? <p className="mt-1 text-xs text-mint">ملاحظة: {o.notes}</p> : null}
                {o.location_url ? (
                  <a
                    href={o.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs font-bold text-saffron"
                  >
                    فتح الموقع ↗
                  </a>
                ) : null}
              </div>
              <div className="text-left">
                <p className="font-head text-lg font-extrabold text-saffron">
                  {money(o.total)} {CURRENCY}
                </p>
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value as (typeof STATUSES)[number])}
                  className="mt-2 rounded-lg border border-line bg-panel px-3 py-2 text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              className="mt-3 text-xs font-semibold text-soft"
            >
              {expanded === o.id ? "إخفاء الأصناف" : `عرض الأصناف (${o.items_count})`}
            </button>

            {expanded === o.id ? (
              <div className="mt-3 grid gap-2 border-t border-line pt-3 text-sm">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between gap-3">
                    <div>
                      <p>
                        {it.quantity}× {it.product_name}
                        {it.size_name ? ` (${it.size_name})` : ""}
                      </p>
                      {Array.isArray(it.extras) && it.extras.length ? (
                        <p className="text-xs text-faint">
                          {(it.extras as ExtraJson[]).map((e) => e.name).join("، ")}
                        </p>
                      ) : null}
                      {it.notes ? <p className="text-xs text-mint">{it.notes}</p> : null}
                    </div>
                    <span>{money(it.line_total)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
        {visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-faint">لا توجد طلبات في هذا التصنيف.</p>
        ) : null}
      </div>
    </div>
  );
}
