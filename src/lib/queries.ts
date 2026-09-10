import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type ProductSize = Tables<"product_sizes">;
export type ProductExtra = Tables<"product_extras">;
export type Promotion = Tables<"promotions">;
export type DeliveryZone = Tables<"delivery_zones">;
export type Settings = Tables<"restaurant_settings">;
export type Branch = Tables<"branches">;
export type BusinessHourRow = Tables<"business_hours">;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const res = await supabase.from("restaurant_settings").select("*").eq("id", 1).maybeSingle();
    if (res.error) throw new Error(res.error.message);
    return res.data as Settings | null;
  },
  staleTime: 60_000,
});

export const hoursQuery = queryOptions({
  queryKey: ["business_hours"],
  queryFn: async () =>
    unwrap<BusinessHourRow[]>(
      await supabase.from("business_hours").select("*").order("day_of_week"),
    ),
  staleTime: 60_000,
});

export const branchesQuery = queryOptions({
  queryKey: ["branches"],
  queryFn: async () =>
    unwrap<Branch[]>(
      await supabase.from("branches").select("*").eq("is_active", true).order("sort_order"),
    ),
  staleTime: 60_000,
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () =>
    unwrap<Category[]>(
      await supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    ),
  staleTime: 30_000,
});

export const allCategoriesQuery = queryOptions({
  queryKey: ["categories", "all"],
  queryFn: async () =>
    unwrap<Category[]>(await supabase.from("categories").select("*").order("sort_order")),
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () =>
    unwrap<Product[]>(
      await supabase.from("products").select("*").order("sort_order").order("name"),
    ),
  staleTime: 30_000,
});

export const promotionsQuery = queryOptions({
  queryKey: ["promotions"],
  queryFn: async () =>
    unwrap<Promotion[]>(
      await supabase.from("promotions").select("*").eq("is_active", true).order("sort_order"),
    ),
  staleTime: 30_000,
});

export const allPromotionsQuery = queryOptions({
  queryKey: ["promotions", "all"],
  queryFn: async () =>
    unwrap<Promotion[]>(await supabase.from("promotions").select("*").order("sort_order")),
});

export const zonesQuery = queryOptions({
  queryKey: ["delivery_zones"],
  queryFn: async () =>
    unwrap<DeliveryZone[]>(
      await supabase.from("delivery_zones").select("*").order("sort_order"),
    ),
  staleTime: 60_000,
});

export function productQuery(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const p = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (p.error) throw new Error(p.error.message);
      if (!p.data) return null;
      const [sizes, extras] = await Promise.all([
        supabase
          .from("product_sizes")
          .select("*")
          .eq("product_id", p.data.id)
          .order("sort_order"),
        supabase
          .from("product_extras")
          .select("*")
          .eq("product_id", p.data.id)
          .order("sort_order"),
      ]);
      return {
        product: p.data as Product,
        sizes: (sizes.data ?? []) as ProductSize[],
        extras: (extras.data ?? []) as ProductExtra[],
      };
    },
  });
}
