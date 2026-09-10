import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import { categoriesQuery, productsQuery } from "@/lib/queries";

const searchSchema = z.object({ cat: z.string().optional(), q: z.string().optional() });

export const Route = createFileRoute("/menu/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "قائمة الطعام | مطعم مزّة" },
      {
        name: "description",
        content:
          "قائمة مطعم مزّة الكاملة: كبسة، مندي، مشاوي، مقبلات، مشروبات وحلويات مع الأسعار والأحجام والإضافات.",
      },
      { property: "og:title", content: "قائمة الطعام | مطعم مزّة" },
      { property: "og:description", content: "تصفّح كل الأطباق والأسعار واطلب مباشرة." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { cat, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const [term, setTerm] = useState(q ?? "");

  const filtered = useMemo(() => {
    const category = categories.find((c) => c.slug === cat);
    const search = term.trim().toLowerCase();
    return products.filter((p) => {
      if (category && p.category_id !== category.id) return false;
      if (!search) return true;
      return `${p.name} ${p.description ?? ""} ${p.keywords ?? ""}`.toLowerCase().includes(search);
    });
  }, [products, categories, cat, term]);

  const grouped = useMemo(() => {
    return categories
      .map((c) => ({ category: c, items: filtered.filter((p) => p.category_id === c.id) }))
      .filter((g) => g.items.length);
  }, [categories, filtered]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-head text-3xl font-black sm:text-4xl">قائمة الطعام</h1>
        <p className="mt-2 text-sm text-faint">
          كل الأطباق تُحضَّر عند الطلب — اختر الحجم والإضافات قبل الإضافة للسلة.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              maxLength={60}
              placeholder="ابحث عن طبق…"
              className="w-full rounded-xl border border-line bg-panel/70 py-3 pr-10 pl-4 text-sm outline-none focus:border-saffron/60"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/menu"
            search={{}}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              !cat ? "border-saffron bg-saffron text-ink" : "border-line bg-panel/70 text-soft"
            }`}
          >
            الكل
          </Link>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ search: { cat: c.slug } })}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                cat === c.slug
                  ? "border-saffron bg-saffron text-ink"
                  : "border-line bg-panel/70 text-soft"
              }`}
            >
              {c.emoji ? `${c.emoji} ` : ""}
              {c.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-panel/60" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <p className="mt-16 text-center text-sm text-faint">لا توجد نتائج مطابقة لبحثك.</p>
        ) : (
          grouped.map((group) => (
            <section key={group.category.id} className="mt-12">
              <h2 className="font-head text-xl font-extrabold">
                {group.category.emoji ? `${group.category.emoji} ` : ""}
                {group.category.name}
              </h2>
              {group.category.description ? (
                <p className="mt-1 text-xs text-faint">{group.category.description}</p>
              ) : null}
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </SiteLayout>
  );
}
