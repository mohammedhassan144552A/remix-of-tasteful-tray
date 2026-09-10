import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { productQuery } from "@/lib/queries";
import { money, CURRENCY } from "@/lib/format";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/menu/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.slug)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "الطبق غير متوفر | مطعم مزّة" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const description =
      product.description ?? `اطلب ${product.name} من مطعم مزّة مع توصيل سريع داخل الرياض.`;
    return {
      meta: [
        { title: `${product.name} | مطعم مزّة` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${product.name} | مطعم مزّة` },
        { property: "og:description", content: description.slice(0, 155) },
      ],
    };
  },
  component: ProductPage,
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-faint">
        تعذّر تحميل الطبق.
      </div>
    </SiteLayout>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useQuery(productQuery(slug));
  const { addItem } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [favorite, setFavorite] = useState(false);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const sizes = data?.sizes.filter((s) => s.is_active) ?? [];
  const extras = data?.extras.filter((e) => e.is_active) ?? [];
  const selectedSize = sizes.find((s) => s.id === (sizeId ?? sizes[0]?.id));

  const unitPrice = selectedSize ? Number(selectedSize.price) : Number(data?.product.price ?? 0);
  const extrasTotal = useMemo(
    () =>
      extras.filter((e) => extraIds.includes(e.id)).reduce((sum, e) => sum + Number(e.price), 0),
    [extras, extraIds],
  );
  const total = (unitPrice + extrasTotal) * quantity;

  if (!data) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-head text-2xl font-bold">الطبق غير موجود</h1>
          <Link to="/menu" className="mt-4 inline-block text-sm font-semibold text-saffron">
            العودة للقائمة
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const { product } = data;

  async function toggleFavorite() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { toast.error("سجّل الدخول لإضافة الطبق إلى المفضلة"); void navigate({ to: "/auth" }); return; }
    if (favorite) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", auth.user.id).eq("product_id", product.id);
      if (error) return toast.error("تعذّر تحديث المفضلة");
      setFavorite(false);
    } else {
      const { error } = await supabase.from("favorites").upsert({ user_id: auth.user.id, product_id: product.id }, { onConflict: "user_id,product_id" });
      if (error) return toast.error("تعذّر تحديث المفضلة");
      setFavorite(true);
    }
    void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    toast.success(favorite ? "تمت الإزالة من المفضلة" : "تمت الإضافة إلى المفضلة");
  }

  function handleAdd() {
    if (!product.is_available) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image_url,
      sizeId: selectedSize?.id ?? null,
      sizeName: selectedSize?.name ?? null,
      unitPrice,
      quantity,
      extras: extras
        .filter((e) => extraIds.includes(e.id))
        .map((e) => ({ id: e.id, name: e.name, price: Number(e.price) })),
      notes: notes.trim(),
    });
    toast.success("تمت الإضافة إلى السلة");
    void navigate({ to: "/cart" });
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/menu" className="text-sm text-faint hover:text-saffron">
          ← القائمة
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-line bg-panel/70">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                width={900}
                height={700}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center text-6xl">🍽️</div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3"><h1 className="font-head text-3xl font-black">{product.name}</h1><Button type="button" variant="outline" size="icon" onClick={toggleFavorite} aria-label="إضافة إلى المفضلة" className={favorite ? "border-terracotta text-terracotta" : "border-line"}><Heart className={favorite ? "fill-current" : ""}/></Button></div>
            {product.description ? (
              <p className="mt-3 text-sm leading-relaxed text-soft">{product.description}</p>
            ) : null}

            {sizes.length ? (
              <div className="mt-6">
                <h2 className="font-head text-sm font-bold">الحجم</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {sizes.map((s) => {
                    const active = (sizeId ?? sizes[0]?.id) === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSizeId(s.id)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                          active
                            ? "border-saffron bg-saffron/10 text-saffron"
                            : "border-line bg-panel/70 text-soft"
                        }`}
                      >
                        <span className="font-semibold">{s.name}</span>
                        <span>{money(s.price)} {CURRENCY}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {extras.length ? (
              <div className="mt-6">
                <h2 className="font-head text-sm font-bold">إضافات</h2>
                <div className="mt-3 grid gap-2">
                  {extras.map((e) => {
                    const active = extraIds.includes(e.id);
                    return (
                      <label
                        key={e.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                          active ? "border-mint/60 bg-mint/10" : "border-line bg-panel/70"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() =>
                              setExtraIds((prev) =>
                                prev.includes(e.id)
                                  ? prev.filter((id) => id !== e.id)
                                  : [...prev, e.id],
                              )
                            }
                            className="size-4 accent-[var(--mint)]"
                          />
                          <span className="font-medium">{e.name}</span>
                        </span>
                        <span className="text-faint">+{money(e.price)} {CURRENCY}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <label htmlFor="notes" className="font-head text-sm font-bold">
                ملاحظات للمطبخ
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 300))}
                rows={3}
                maxLength={300}
                placeholder="مثال: بدون بصل، حار خفيف"
                className="mt-2 w-full rounded-xl border border-line bg-panel/70 p-3 text-sm outline-none focus:border-saffron/60"
              />
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-xl border border-line bg-panel/70 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid size-9 place-items-center rounded-lg hover:bg-panel2"
                  aria-label="إنقاص"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center font-head font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                  className="grid size-9 place-items-center rounded-lg hover:bg-panel2"
                  aria-label="زيادة"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={!product.is_available}
                className="flex-1 rounded-xl gradient-warm px-6 py-3.5 font-head font-bold text-ink disabled:opacity-50"
              >
                {product.is_available
                  ? `أضف للسلة · ${money(total)} ${CURRENCY}`
                  : "غير متوفر حاليًا"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
