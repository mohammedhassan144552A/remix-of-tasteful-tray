import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { useCart, lineTotal } from "@/lib/cart";
import { settingsQuery, zonesQuery, hoursQuery } from "@/lib/queries";
import { getOpenState } from "@/lib/hours";
import { money, CURRENCY, normalizeSaudiPhone, isValidMapUrl } from "@/lib/format";
import { createOrder, checkCoupon } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب | مطعم مزّة" },
      { name: "description", content: "أدخل بياناتك واختر التوصيل أو الاستلام لإرسال طلبك." },
      { property: "og:title", content: "إتمام الطلب | مطعم مزّة" },
      { property: "og:description", content: "أرسل طلبك خلال دقيقة." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function newToken() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clear, ready } = useCart();
  const { data: settings } = useQuery(settingsQuery);
  const { data: zones = [] } = useQuery(zonesQuery);
  const { data: hours = [] } = useQuery(hoursQuery);
  const submitOrder = useServerFn(createOrder);
  const validateCoupon = useServerFn(checkCoupon);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [zoneId, setZoneId] = useState<string>("");
  const [locationUrl, setLocationUrl] = useState("");
  const [addressText, setAddressText] = useState("");
  const [addressNotes, setAddressNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [token] = useState(newToken);
  const [submitting, setSubmitting] = useState(false);

  const openState = getOpenState(hours);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const profile = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile.data?.full_name) setName((v) => v || profile.data!.full_name!);
      if (profile.data?.phone) setPhone((v) => v || profile.data!.phone!);
    });
  }, []);

  const zone = zones.find((z) => z.id === zoneId);
  const deliveryFee = useMemo(() => {
    if (fulfillment !== "delivery" || !zone) return 0;
    if (
      settings?.free_delivery_threshold != null &&
      subtotal >= Number(settings.free_delivery_threshold)
    )
      return 0;
    return Number(zone.delivery_fee);
  }, [fulfillment, zone, settings, subtotal]);

  const total = Math.max(0, subtotal - discount) + deliveryFee;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    const res = await validateCoupon({ data: { code: couponCode.trim(), subtotal } });
    if (res.ok) {
      setDiscount(res.discount);
      setAppliedCode(couponCode.trim().toUpperCase());
      toast.success(res.message);
    } else {
      setDiscount(0);
      setAppliedCode(null);
      toast.error(res.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (name.trim().length < 2) {
      toast.error("أدخل الاسم كاملًا");
      return;
    }
    if (!normalizeSaudiPhone(phone)) {
      toast.error("رقم الجوال غير صحيح (05XXXXXXXX)");
      return;
    }
    if (fulfillment === "delivery") {
      if (!zoneId) {
        toast.error("اختر منطقة التوصيل");
        return;
      }
      if (!isValidMapUrl(locationUrl)) {
        toast.error("أضف رابط موقعك من خرائط Google");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await submitOrder({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
          fulfillment,
          zoneId: fulfillment === "delivery" ? zoneId : null,
          locationUrl: fulfillment === "delivery" ? locationUrl.trim() : null,
          addressText: addressText.trim() || null,
          addressNotes: addressNotes.trim() || null,
          couponCode: appliedCode,
          clientToken: token,
          items: items.map((i) => ({
            productId: i.productId,
            sizeId: i.sizeId,
            extraIds: i.extras.map((e) => e.id),
            quantity: i.quantity,
            notes: i.notes,
          })),
        },
      });
      clear();
      void navigate({ to: "/order/$orderNumber", params: { orderNumber: String(res.orderNumber) } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذّر إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-head text-2xl font-bold">لا يوجد طلب لإتمامه</h1>
          <Link to="/menu" className="mt-4 inline-block text-sm font-semibold text-saffron">
            تصفّح القائمة
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-line bg-panel/70 px-4 py-3 text-sm outline-none focus:border-saffron/60";

  return (
    <SiteLayout>
      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-head text-3xl font-black">إتمام الطلب</h1>
        {!openState.isOpen && !settings?.allow_order_when_closed ? (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
            المطعم مغلق الآن ({openState.label}) — لا يمكن استقبال الطلبات حاليًا.
          </p>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="grid gap-6">
            <section className="rounded-2xl border border-line bg-panel/70 p-5">
              <h2 className="font-head text-lg font-bold">بياناتك</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-xs text-faint">الاسم</label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 80))}
                    maxLength={80}
                    required
                    className={`mt-1 ${fieldClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-xs text-faint">الجوال</label>
                  <input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.slice(0, 20))}
                    inputMode="tel"
                    dir="ltr"
                    placeholder="05XXXXXXXX"
                    required
                    className={`mt-1 text-right ${fieldClass}`}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-panel/70 p-5">
              <h2 className="font-head text-lg font-bold">طريقة الاستلام</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(
                  [
                    { key: "delivery", label: "توصيل للموقع", enabled: settings?.delivery_enabled ?? true },
                    { key: "pickup", label: "استلام من الفرع", enabled: settings?.pickup_enabled ?? true },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={!opt.enabled}
                    onClick={() => setFulfillment(opt.key)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-40 ${
                      fulfillment === opt.key
                        ? "border-saffron bg-saffron/10 text-saffron"
                        : "border-line text-soft"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {fulfillment === "delivery" ? (
                <div className="mt-4 grid gap-3">
                  <div>
                    <label htmlFor="zone" className="text-xs text-faint">منطقة التوصيل</label>
                    <select
                      id="zone"
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      required
                      className={`mt-1 ${fieldClass}`}
                    >
                      <option value="">اختر المنطقة…</option>
                      {zones
                        .filter((z) => z.is_active)
                        .map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name} — {money(z.delivery_fee)} {CURRENCY} · {z.eta_minutes} دقيقة
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="loc" className="text-xs text-faint">
                      رابط الموقع من خرائط Google
                    </label>
                    <input
                      id="loc"
                      value={locationUrl}
                      onChange={(e) => setLocationUrl(e.target.value.slice(0, 500))}
                      dir="ltr"
                      placeholder="https://maps.app.goo.gl/..."
                      required
                      className={`mt-1 text-right ${fieldClass}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="addr" className="text-xs text-faint">وصف العنوان (اختياري)</label>
                    <input
                      id="addr"
                      value={addressText}
                      onChange={(e) => setAddressText(e.target.value.slice(0, 300))}
                      className={`mt-1 ${fieldClass}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="addrn" className="text-xs text-faint">
                      علامة مميزة / رقم الشقة (اختياري)
                    </label>
                    <input
                      id="addrn"
                      value={addressNotes}
                      onChange={(e) => setAddressNotes(e.target.value.slice(0, 300))}
                      className={`mt-1 ${fieldClass}`}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-faint">
                  الاستلام من: {settings?.address ?? "فرع المطعم"}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-line bg-panel/70 p-5">
              <label htmlFor="onotes" className="font-head text-lg font-bold">
                ملاحظات على الطلب
              </label>
              <textarea
                id="onotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                rows={3}
                className={`mt-3 ${fieldClass}`}
              />
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-line bg-panel/70 p-5 lg:sticky lg:top-24">
            <h2 className="font-head text-lg font-bold">الملخص</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {items.map((i) => (
                <div key={i.key} className="flex justify-between gap-2 text-xs">
                  <span className="text-faint">
                    {i.quantity}× {i.name}
                    {i.sizeName ? ` (${i.sizeName})` : ""}
                  </span>
                  <span>{money(lineTotal(i))}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.slice(0, 40))}
                placeholder="كود الخصم"
                className="flex-1 rounded-xl border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-saffron/60"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-xl border border-saffron/40 px-4 text-sm font-bold text-saffron"
              >
                تطبيق
              </button>
            </div>

            <div className="mt-4 grid gap-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-faint">المجموع الفرعي</span>
                <span>{money(subtotal)} {CURRENCY}</span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-mint">
                  <span>الخصم ({appliedCode})</span>
                  <span>-{money(discount)} {CURRENCY}</span>
                </div>
              ) : null}
              {fulfillment === "delivery" ? (
                <div className="flex justify-between">
                  <span className="text-faint">التوصيل</span>
                  <span>{deliveryFee === 0 ? "مجاني" : `${money(deliveryFee)} ${CURRENCY}`}</span>
                </div>
              ) : null}
              <div className="mt-1 flex justify-between border-t border-line pt-3 font-head text-lg font-extrabold">
                <span>الإجمالي</span>
                <span className="text-saffron">{money(total)} {CURRENCY}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-xl gradient-warm px-6 py-3.5 font-head font-bold text-ink disabled:opacity-60"
            >
              {submitting ? "جارِ الإرسال…" : "تأكيد الطلب"}
            </button>
            <p className="mt-3 text-center text-[11px] text-faint">
              الدفع عند الاستلام — نقدًا أو بالشبكة.
            </p>
          </aside>
        </div>
      </form>
    </SiteLayout>
  );
}
