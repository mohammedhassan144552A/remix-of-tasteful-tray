import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { useCart, lineTotal } from "@/lib/cart";
import { money, CURRENCY } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة المشتريات | مطعم مزّة" },
      { name: "description", content: "راجع أصناف طلبك وعدّل الكميات قبل إتمام الطلب." },
      { property: "og:title", content: "سلة المشتريات | مطعم مزّة" },
      { property: "og:description", content: "راجع طلبك قبل الإرسال." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQuantity, removeItem, ready } = useCart();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-head text-3xl font-black">السلة</h1>

        {!ready ? null : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-line bg-panel/60 p-10 text-center">
            <p className="text-sm text-faint">سلتك فارغة حاليًا.</p>
            <Link
              to="/menu"
              className="mt-5 inline-block rounded-xl gradient-warm px-6 py-3 font-head font-bold text-ink"
            >
              تصفّح القائمة
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
            <div className="grid gap-3">
              {items.map((item) => (
                <article
                  key={item.key}
                  className="flex gap-3 rounded-2xl border border-line bg-panel/70 p-3"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      width={160}
                      height={160}
                      className="size-20 shrink-0 rounded-xl object-cover"
                    />
                  ) : null}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-head text-sm font-bold">{item.name}</h2>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-faint hover:text-destructive"
                        aria-label="حذف"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {item.sizeName ? (
                      <p className="mt-1 text-xs text-faint">الحجم: {item.sizeName}</p>
                    ) : null}
                    {item.extras.length ? (
                      <p className="mt-1 text-xs text-faint">
                        إضافات: {item.extras.map((e) => e.name).join("، ")}
                      </p>
                    ) : null}
                    {item.notes ? (
                      <p className="mt-1 text-xs text-mint">ملاحظة: {item.notes}</p>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-lg border border-line p-0.5">
                        <button
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="grid size-7 place-items-center rounded hover:bg-panel2"
                          aria-label="إنقاص"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          className="grid size-7 place-items-center rounded hover:bg-panel2"
                          aria-label="زيادة"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-head text-sm font-extrabold text-saffron">
                        {money(lineTotal(item))} {CURRENCY}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-line bg-panel/70 p-5 lg:sticky lg:top-24">
              <h2 className="font-head text-lg font-bold">ملخص الطلب</h2>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-faint">المجموع الفرعي</span>
                <span className="font-bold">
                  {money(subtotal)} {CURRENCY}
                </span>
              </div>
              <p className="mt-2 text-xs text-faint">
                رسوم التوصيل والخصومات تُحسب في صفحة إتمام الطلب.
              </p>
              <Link
                to="/checkout"
                className="mt-5 block rounded-xl gradient-warm px-6 py-3.5 text-center font-head font-bold text-ink"
              >
                إتمام الطلب
              </Link>
              <Link
                to="/menu"
                className="mt-2 block rounded-xl border border-line px-6 py-3 text-center text-sm font-semibold text-soft"
              >
                إضافة المزيد
              </Link>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
