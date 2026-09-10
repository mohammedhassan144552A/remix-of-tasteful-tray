import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { money, CURRENCY, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "طلباتي | مطعم مزّة" },
      { name: "description", content: "سجل طلباتك السابقة وحالتها." },
      { property: "og:title", content: "طلباتي | مطعم مزّة" },
      { property: "og:description", content: "تابع كل طلباتك من مكان واحد." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await supabase
        .from("orders")
        .select("order_number, status, total, created_at, items_count, fulfillment")
        .order("created_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-head text-3xl font-black">طلباتي</h1>

        {isLoading ? (
          <p className="mt-8 text-sm text-faint">جارِ التحميل…</p>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-line bg-panel/60 p-10 text-center">
            <p className="text-sm text-faint">لا توجد طلبات بعد.</p>
            <Link to="/menu" className="mt-4 inline-block text-sm font-bold text-saffron">
              ابدأ أول طلب
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {orders.map((o) => (
              <Link
                key={o.order_number}
                to="/order/$orderNumber"
                params={{ orderNumber: String(o.order_number) }}
                className="flex items-center justify-between rounded-2xl border border-line bg-panel/70 p-4 transition-colors hover:border-saffron/50"
              >
                <div>
                  <p className="font-head font-bold">#{o.order_number}</p>
                  <p className="mt-1 text-xs text-faint">
                    {formatDate(o.created_at)} · {o.items_count} صنف ·{" "}
                    {o.fulfillment === "delivery" ? "توصيل" : "استلام"}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-head font-extrabold text-saffron">
                    {money(o.total)} {CURRENCY}
                  </p>
                  <p className="mt-1 text-xs text-faint">
                    {ORDER_STATUS_LABELS[o.status] ?? o.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
