import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "تتبع طلبك | مطعم مزّة" },
      {
        name: "description",
        content: "أدخل رقم طلبك لمتابعة حالته: قيد التجهيز، جاهز، أو خرج للتوصيل.",
      },
      { property: "og:title", content: "تتبع طلبك | مطعم مزّة" },
      { property: "og:description", content: "تابع حالة طلبك لحظة بلحظة." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-20">
        <h1 className="font-head text-3xl font-black">تتبع طلبك</h1>
        <p className="mt-2 text-sm text-faint">أدخل رقم الطلب الظاهر في صفحة التأكيد.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const num = value.replace(/\D/g, "");
            if (num) void navigate({ to: "/order/$orderNumber", params: { orderNumber: num } });
          }}
          className="mt-6 flex gap-2"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, 12))}
            inputMode="numeric"
            placeholder="مثال: 10025"
            className="flex-1 rounded-xl border border-line bg-panel/70 px-4 py-3 text-sm outline-none focus:border-saffron/60"
          />
          <button className="rounded-xl gradient-warm px-6 font-head font-bold text-ink">
            بحث
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}
