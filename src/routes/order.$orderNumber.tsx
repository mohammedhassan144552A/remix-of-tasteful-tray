import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { getOrderStatus } from "@/lib/orders.functions";
import {
  money,
  CURRENCY,
  formatDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_FLOW,
} from "@/lib/format";

export const Route = createFileRoute("/order/$orderNumber")({
  head: () => ({
    meta: [
      { title: "حالة الطلب | مطعم مزّة" },
      { name: "description", content: "تفاصيل طلبك وحالته الحالية." },
      { property: "og:title", content: "حالة الطلب | مطعم مزّة" },
      { property: "og:description", content: "تابع حالة طلبك من مطعم مزّة." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

type ExtraJson = { name?: string };

function OrderPage() {
  const { orderNumber } = Route.useParams();
  const fetchStatus = useServerFn(getOrderStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => fetchStatus({ data: { orderNumber: Number(orderNumber) } }),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-faint">
          جارِ التحميل…
        </div>
      </SiteLayout>
    );
  }

  if (!data) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-head text-2xl font-bold">لم نجد هذا الطلب</h1>
          <p className="mt-2 text-sm text-faint">تأكد من رقم الطلب وحاول مرة أخرى.</p>
          <Link to="/track" className="mt-5 inline-block text-sm font-semibold text-saffron">
            العودة للتتبع
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { order, items } = data;
  const cancelled = order.status === "cancelled";
  const flow =
    order.fulfillment === "pickup"
      ? (["received", "preparing", "ready", "picked_up"] as const)
      : ORDER_STATUS_FLOW;
  const normalized = order.status === "new" ? "received" : order.status;
  const currentIndex = (flow as readonly string[]).indexOf(normalized);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rise rounded-3xl border border-line bg-panel/70 p-6 text-center">
          <span className="grid mx-auto size-14 place-items-center rounded-full gradient-warm text-ink">
            <Check className="size-7" />
          </span>
          <h1 className="mt-4 font-head text-2xl font-black">طلبك رقم #{order.order_number}</h1>
          <p className="mt-1 text-sm text-faint">
            {formatDate(order.created_at)} · {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </p>
        </div>

        {cancelled ? (
          <p className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-center text-sm">
            تم إلغاء هذا الطلب. للاستفسار تواصل معنا.
          </p>
        ) : (
          <ol className="mt-6 grid gap-2">
            {flow.map((step, index) => {
              const done = index <= currentIndex;
              return (
                <li
                  key={step}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                    done ? "border-mint/40 bg-mint/10 text-mint" : "border-line bg-panel/50 text-faint"
                  }`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                      done ? "bg-mint text-ink" : "bg-panel2"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {ORDER_STATUS_LABELS[step]}
                </li>
              );
            })}
          </ol>
        )}

        <section className="mt-6 rounded-2xl border border-line bg-panel/70 p-5">
          <h2 className="font-head text-lg font-bold">تفاصيل الطلب</h2>
          <div className="mt-4 grid gap-3">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold">
                    {item.quantity}× {item.product_name}
                    {item.size_name ? ` (${item.size_name})` : ""}
                  </p>
                  {Array.isArray(item.extras) && item.extras.length ? (
                    <p className="text-xs text-faint">
                      {(item.extras as ExtraJson[]).map((e) => e.name).join("، ")}
                    </p>
                  ) : null}
                  {item.notes ? <p className="text-xs text-mint">{item.notes}</p> : null}
                </div>
                <span className="shrink-0">{money(item.line_total)} {CURRENCY}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-faint">المجموع الفرعي</span>
              <span>{money(order.subtotal)} {CURRENCY}</span>
            </div>
            {Number(order.discount) > 0 ? (
              <div className="flex justify-between text-mint">
                <span>الخصم</span>
                <span>-{money(order.discount)} {CURRENCY}</span>
              </div>
            ) : null}
            {order.fulfillment === "delivery" ? (
              <div className="flex justify-between">
                <span className="text-faint">
                  التوصيل{order.delivery_zone_name ? ` — ${order.delivery_zone_name}` : ""}
                </span>
                <span>
                  {Number(order.delivery_fee) === 0
                    ? "مجاني"
                    : `${money(order.delivery_fee)} ${CURRENCY}`}
                </span>
              </div>
            ) : null}
            <div className="mt-1 flex justify-between border-t border-line pt-3 font-head text-lg font-extrabold">
              <span>الإجمالي</span>
              <span className="text-saffron">{money(order.total)} {CURRENCY}</span>
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-center gap-3">
          <Link to="/menu" className="rounded-xl gradient-warm px-6 py-3 font-head font-bold text-ink">
            اطلب مرة أخرى
          </Link>
          <Link to="/" className="rounded-xl border border-line px-6 py-3 text-sm font-semibold">
            الرئيسية
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
