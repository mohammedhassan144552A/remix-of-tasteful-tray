import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import {
  categoriesQuery,
  productsQuery,
  promotionsQuery,
  settingsQuery,
  zonesQuery,
} from "@/lib/queries";
import { money, CURRENCY } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مطعم مزّة | كبسة ومندي ومشاوي مع توصيل سريع بالرياض" },
      {
        name: "description",
        content:
          "اطلب أطباق الأرز والمشاوي الطازجة من مطعم مزّة. عروض يومية، توصيل سريع داخل الرياض، واستلام من الفرع خلال دقائق.",
      },
      { property: "og:title", content: "مطعم مزّة | كبسة ومندي ومشاوي" },
      {
        property: "og:description",
        content: "قائمة كاملة، عروض يومية، وتوصيل سريع داخل الرياض.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const { data: promotions = [] } = useQuery(promotionsQuery);
  const { data: zones = [] } = useQuery(zonesQuery);

  const featured = products.filter((p) => p.is_featured && p.is_available).slice(0, 6);
  const popular = products.filter((p) => p.is_popular && p.is_available).slice(0, 4);

  return (
    <SiteLayout>
      {/* البطل */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:pt-20">
        <div className="rise max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1.5 text-xs font-semibold text-saffron">
            طازج يوميًا · من الرياض
          </span>
          <h1 className="mt-5 font-head text-4xl leading-[1.15] font-black sm:text-6xl">
            {settings?.hero_title ?? "طعم البيت… بنكهة المطاعم"}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-soft sm:text-lg">
            {settings?.hero_subtitle ??
              "كبسة ومندي ومشاوي تُحضَّر عند الطلب، مع توصيل سريع داخل الرياض أو استلام من الفرع."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="rounded-xl gradient-warm px-6 py-3.5 font-head font-bold text-ink"
            >
              تصفّح القائمة
            </Link>
            <Link
              to="/track"
              className="rounded-xl border border-line bg-panel/70 px-6 py-3.5 font-head font-semibold backdrop-blur"
            >
              تتبع طلبك
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Clock,
              title: `تجهيز خلال ${settings?.prep_minutes ?? 25} دقيقة`,
              text: "نبدأ التحضير فور تأكيد الطلب",
            },
            {
              icon: Truck,
              title: settings?.free_delivery_threshold
                ? `توصيل مجاني فوق ${money(settings.free_delivery_threshold)} ${CURRENCY}`
                : "توصيل سريع",
              text: `${zones.length} مناطق تغطية داخل الرياض`,
            },
            { icon: MapPin, title: "استلام من الفرع", text: settings?.address ?? "الرياض" },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-line bg-panel/60 p-4 backdrop-blur"
            >
              <f.icon className="size-5 text-saffron" />
              <p className="mt-3 font-head text-sm font-bold">{f.title}</p>
              <p className="mt-1 text-xs text-faint">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* التصنيفات */}
      {categories.length ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="font-head text-2xl font-extrabold">تصفّح حسب القسم</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/menu"
                search={{ cat: c.slug }}
                className="group relative overflow-hidden rounded-2xl border border-line bg-panel/70"
              >
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    loading="lazy"
                    width={400}
                    height={300}
                    className="h-28 w-full object-cover opacity-70 transition group-hover:opacity-100"
                  />
                ) : (
                  <div className="grid h-28 place-items-center text-3xl">{c.emoji ?? "🍽️"}</div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-3">
                  <span className="font-head text-sm font-bold">{c.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* العروض */}
      {promotions.length ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="font-head text-2xl font-extrabold">عروض هذا الأسبوع</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {promotions.map((p) => (
              <article
                key={p.id}
                className="flex overflow-hidden rounded-2xl border border-line bg-panel/70"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    loading="lazy"
                    width={320}
                    height={320}
                    className="w-32 shrink-0 object-cover sm:w-44"
                  />
                ) : null}
                <div className="flex flex-1 flex-col p-4">
                  {p.badge ? (
                    <span className="w-fit rounded-full bg-terracotta/20 px-2.5 py-1 text-[11px] font-bold text-terracotta">
                      {p.badge}
                    </span>
                  ) : null}
                  <h3 className="mt-2 font-head text-lg font-bold">{p.title}</h3>
                  {p.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-faint">{p.description}</p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    {p.price ? (
                      <span className="font-head text-lg font-extrabold text-saffron">
                        {money(p.price)} {CURRENCY}
                      </span>
                    ) : (
                      <span />
                    )}
                    <Link
                      to="/menu"
                      className="rounded-lg border border-saffron/40 px-3 py-1.5 text-xs font-bold text-saffron"
                    >
                      {p.button_label ?? "اطلب الآن"}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* الأطباق المميزة */}
      {featured.length ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-end justify-between">
            <h2 className="font-head text-2xl font-extrabold">الأطباق المميزة</h2>
            <Link to="/menu" className="text-sm font-semibold text-saffron">
              كل القائمة
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {popular.length ? (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="font-head text-2xl font-extrabold">الأكثر طلبًا</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
