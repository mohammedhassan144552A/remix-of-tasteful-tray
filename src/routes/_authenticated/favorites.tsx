import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard } from "@/components/product-card";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({
    meta: [
      { title: "المفضلة | مطعم مزّة" },
      { name: "description", content: "الأطباق التي أضفتها إلى مفضلتك." },
      { property: "og:title", content: "المفضلة | مطعم مزّة" },
      { property: "og:description", content: "أطباقك المفضلة في مكان واحد." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const favs = await supabase.from("favorites").select("product_id");
      if (favs.error) throw new Error(favs.error.message);
      const ids = favs.data.map((f) => f.product_id);
      if (!ids.length) return [] as Product[];
      const res = await supabase.from("products").select("*").in("id", ids);
      if (res.error) throw new Error(res.error.message);
      return res.data as Product[];
    },
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-head text-3xl font-black">المفضلة</h1>
        {isLoading ? (
          <p className="mt-8 text-sm text-faint">جارِ التحميل…</p>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-line bg-panel/60 p-10 text-center">
            <p className="text-sm text-faint">لم تضف أي طبق للمفضلة بعد.</p>
            <Link to="/menu" className="mt-4 inline-block text-sm font-bold text-saffron">
              تصفّح القائمة
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
