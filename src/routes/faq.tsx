import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteLayout } from "@/components/site-layout";
import { settingsQuery, zonesQuery } from "@/lib/queries";
import { money, CURRENCY } from "@/lib/format";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "الأسئلة الشائعة | مطعم مزّة" },
      {
        name: "description",
        content: "إجابات عن التوصيل، مدة التحضير، الدفع، الحد الأدنى للطلب، والإلغاء.",
      },
      { property: "og:title", content: "الأسئلة الشائعة | مطعم مزّة" },
      { property: "og:description", content: "كل ما تحتاج معرفته قبل الطلب." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: zones = [] } = useQuery(zonesQuery);

  const faqs = [
    {
      q: "كم يستغرق تحضير الطلب؟",
      a: `عادةً ${settings?.prep_minutes ?? 25} دقيقة تقريبًا، وقد تزيد قليلًا في أوقات الذروة.`,
    },
    {
      q: "ما هي مناطق التوصيل؟",
      a: zones.length
        ? `نغطي: ${zones
            .filter((z) => z.is_active)
            .map((z) => `${z.name} (${money(z.delivery_fee)} ${CURRENCY})`)
            .join("، ")}.`
        : "يتم تحديد مناطق التوصيل عند إتمام الطلب.",
    },
    {
      q: "هل هناك حد أدنى للطلب؟",
      a: `الحد الأدنى ${money(settings?.min_order_total ?? 0)} ${CURRENCY}، وقد يختلف حسب منطقة التوصيل.`,
    },
    {
      q: "كيف أدفع؟",
      a: "الدفع عند الاستلام نقدًا أو بالشبكة مع المندوب أو في الفرع.",
    },
    {
      q: "كيف أتتبع طلبي؟",
      a: "من صفحة تتبع الطلب، أدخل رقم الطلب الظاهر بعد التأكيد وستظهر لك الحالة لحظيًا.",
    },
    {
      q: "هل يمكن إلغاء الطلب؟",
      a: "يمكن الإلغاء قبل بدء التحضير عبر الاتصال بنا مباشرة. بعد بدء التحضير لا يمكن الإلغاء.",
    },
  ];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-head text-3xl font-black sm:text-4xl">الأسئلة الشائعة</h1>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-line">
              <AccordionTrigger className="text-right font-head text-base font-bold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-faint">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SiteLayout>
  );
}
