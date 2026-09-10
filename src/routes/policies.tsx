import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "السياسات | مطعم مزّة" },
      {
        name: "description",
        content: "سياسة الطلب والإلغاء والاسترجاع وسياسة الخصوصية في مطعم مزّة.",
      },
      { property: "og:title", content: "السياسات | مطعم مزّة" },
      { property: "og:description", content: "سياسات الطلب والخصوصية." },
    ],
  }),
  component: PoliciesPage,
});

const SECTIONS = [
  {
    title: "سياسة الطلب",
    body: [
      "يبدأ تحضير الطلب فور تأكيده من الفرع، وتظهر حالته في صفحة تتبع الطلب.",
      "الأسعار المعروضة شاملة، وقد تُضاف رسوم التوصيل حسب المنطقة المختارة.",
      "قد يتعذّر تنفيذ الطلب عند نفاد صنف؛ في هذه الحالة نتواصل معك قبل التحضير.",
    ],
  },
  {
    title: "الإلغاء والاسترجاع",
    body: [
      "يمكن إلغاء الطلب قبل بدء التحضير عبر الاتصال بالفرع.",
      "في حال وصول طلب خاطئ أو غير مطابق، نلتزم باستبداله أو إعادة قيمته.",
      "لا يمكن استرجاع الأطعمة المحضّرة بعد التسليم إلا في حالات الخطأ من طرفنا.",
    ],
  },
  {
    title: "الخصوصية",
    body: [
      "نجمع الاسم ورقم الجوال والموقع لغرض تنفيذ الطلب وتوصيله فقط.",
      "لا نشارك بياناتك مع أي جهة خارجية لأغراض تسويقية.",
      "يمكنك طلب حذف حسابك وبياناتك عبر التواصل معنا.",
    ],
  },
];

function PoliciesPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-head text-3xl font-black sm:text-4xl">السياسات</h1>
        {SECTIONS.map((section) => (
          <section key={section.title} className="mt-8">
            <h2 className="font-head text-xl font-extrabold text-saffron">{section.title}</h2>
            <ul className="mt-3 grid gap-2">
              {section.body.map((line) => (
                <li key={line} className="text-sm leading-relaxed text-soft">
                  • {line}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SiteLayout>
  );
}
