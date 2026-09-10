import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { settingsQuery, hoursQuery, branchesQuery } from "@/lib/queries";
import { DAY_NAMES, formatTime } from "@/lib/hours";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن مطعم مزّة | قصتنا وأوقات العمل" },
      {
        name: "description",
        content: "تعرّف على مطعم مزّة: مطبخنا، مصادر موادنا، أوقات العمل وفروعنا داخل الرياض.",
      },
      { property: "og:title", content: "عن مطعم مزّة" },
      { property: "og:description", content: "قصتنا، أوقات العمل، والفروع." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: hours = [] } = useQuery(hoursQuery);
  const { data: branches = [] } = useQuery(branchesQuery);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-head text-3xl font-black sm:text-4xl">عن المطعم</h1>
        <p className="mt-4 text-base leading-relaxed text-soft">
          {settings?.about_text ??
            "بدأنا من مطبخ صغير بفكرة واحدة: أكل طازج يُحضَّر عند الطلب، بتوابل نطحنها بأنفسنا وأرز نختاره بعناية. اليوم نقدّم نفس الطبق بنفس الاهتمام، مع خدمة توصيل سريعة داخل الرياض."}
        </p>

        <section className="mt-10">
          <h2 className="font-head text-xl font-extrabold">أوقات العمل</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-panel/70">
            {DAY_NAMES.map((day, index) => {
              const row = hours.find((h) => h.day_of_week === index);
              return (
                <div
                  key={day}
                  className="flex items-center justify-between border-b border-line px-4 py-3 text-sm last:border-0"
                >
                  <span className="font-semibold">{day}</span>
                  <span className="text-faint" dir="ltr">
                    {!row || row.is_closed
                      ? "مغلق"
                      : `${formatTime(row.open_time)} — ${formatTime(row.close_time)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {branches.length ? (
          <section className="mt-10">
            <h2 className="font-head text-xl font-extrabold">فروعنا</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {branches.map((b) => (
                <article key={b.id} className="rounded-2xl border border-line bg-panel/70 p-5">
                  <h3 className="font-head font-bold">{b.name}</h3>
                  {b.address ? <p className="mt-1 text-sm text-faint">{b.address}</p> : null}
                  {b.phone ? (
                    <a href={`tel:${b.phone}`} dir="ltr" className="mt-2 block text-sm text-saffron">
                      {b.phone}
                    </a>
                  ) : null}
                  {b.map_url ? (
                    <a
                      href={b.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-xs font-bold text-mint"
                    >
                      عرض على الخريطة ↗
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10">
          <Link
            to="/menu"
            className="inline-block rounded-xl gradient-warm px-6 py-3.5 font-head font-bold text-ink"
          >
            تصفّح القائمة
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
