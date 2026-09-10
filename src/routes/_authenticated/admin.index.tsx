import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { money, CURRENCY, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [orders, products, visits] = await Promise.all([
        supabase
          .from("orders")
          .select("order_number, status, total, created_at, customer_name, fulfillment")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("products").select("id, is_available"),
        supabase.from("site_visits").select("count").gte("visit_date", today.toISOString().slice(0, 10)),
      ]);
      if (orders.error) throw new Error(orders.error.message);
      const all = orders.data;
      const todayOrders = all.filter((o) => new Date(o.created_at) >= today);
      return {
        recent: all.slice(0, 8),
        todayCount: todayOrders.length,
        todayRevenue: todayOrders
          .filter((o) => o.status !== "cancelled")
          .reduce((s, o) => s + Number(o.total), 0),
        active: all.filter((o) => !["delivered", "picked_up", "cancelled"].includes(o.status))
          .length,
        productCount: products.data?.length ?? 0,
        unavailable: products.data?.filter((p) => !p.is_available).length ?? 0,
        visits: visits.data?.reduce((s, v) => s + v.count, 0) ?? 0,
      };
    },
    refetchInterval: 30_000,
  });

  const stats = [
    { label: "طلبات اليوم", value: data?.todayCount ?? 0 },
    { label: "مبيعات اليوم", value: `${money(data?.todayRevenue ?? 0)} ${CURRENCY}` },
    { label: "طلبات قيد التنفيذ", value: data?.active ?? 0 },
    { label: "زيارات اليوم", value: data?.visits ?? 0 },
    { label: "عدد الأطباق", value: data?.productCount ?? 0 },
    { label: "أطباق غير متوفرة", value: data?.unavailable ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-head text-2xl font-black">نظرة عامة</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-panel/70 p-5">
            <p className="text-xs text-faint">{s.label}</p>
            <p className="mt-2 font-head text-2xl font-extrabold text-saffron">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-head text-xl font-extrabold">أحدث الطلبات</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-saffron">
            كل الطلبات
          </Link>
        </div>
        <div className="mt-4 grid gap-2">
          {data?.recent.map((o) => (
            <Link
              key={o.order_number}
              to="/admin/orders"
              className="flex items-center justify-between rounded-xl border border-line bg-panel/70 p-4 text-sm"
            >
              <div>
                <p className="font-head font-bold">#{o.order_number} — {o.customer_name}</p>
                <p className="mt-1 text-xs text-faint">{formatDate(o.created_at)}</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-saffron">{money(o.total)} {CURRENCY}</p>
                <p className="mt-1 text-xs text-faint">{ORDER_STATUS_LABELS[o.status]}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
