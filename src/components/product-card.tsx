import { Link } from "@tanstack/react-router";
import { money, CURRENCY } from "@/lib/format";
import type { Product } from "@/lib/queries";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/menu/$slug"
      params={{ slug: product.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-panel/70 backdrop-blur transition-colors hover:border-saffron/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel2">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            width={640}
            height={480}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl">🍽️</div>
        )}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
          {product.badge ? (
            <span className="rounded-full gradient-warm px-2.5 py-1 text-[11px] font-bold text-ink">
              {product.badge}
            </span>
          ) : null}
          {product.is_new ? (
            <span className="rounded-full bg-mint/90 px-2.5 py-1 text-[11px] font-bold text-ink">
              جديد
            </span>
          ) : null}
        </div>
        {!product.is_available ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70 font-head font-bold">
            غير متوفر حاليًا
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-head text-base font-bold leading-tight">{product.name}</h3>
        {product.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-faint">{product.description}</p>
        ) : null}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-head text-lg font-extrabold text-saffron">
              {money(product.price)}
            </span>
            <span className="text-[11px] text-faint">{CURRENCY}</span>
            {product.compare_at_price ? (
              <span className="text-xs text-faint line-through">
                {money(product.compare_at_price)}
              </span>
            ) : null}
          </div>
          <span className="rounded-lg border border-saffron/40 px-3 py-1.5 text-xs font-bold text-saffron transition-colors group-hover:bg-saffron group-hover:text-ink">
            أضف
          </span>
        </div>
      </div>
    </Link>
  );
}
