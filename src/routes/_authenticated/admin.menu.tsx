import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { money, CURRENCY } from "@/lib/format";
import { allCategoriesQuery, productsQuery, type Product } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/menu")({
  component: AdminMenu,
});

const empty = {
  name: "",
  slug: "",
  description: "",
  price: "0",
  category_id: "",
  image_url: "",
  badge: "",
};

function AdminMenu() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery(allCategoriesQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  async function toggle(product: Product, field: "is_available" | "is_featured" | "is_popular") {
    const { error } = await supabase
      .from("products")
      .update({ [field]: !product[field] })
      .eq("id", product.id);
    if (error) toast.error("تعذّر التحديث");
    else refresh();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || Number.isNaN(price) || price < 0) {
      toast.error("أدخل اسمًا وسعرًا صحيحًا");
      return;
    }
    const slug =
      form.slug.trim() ||
      form.name.trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "").toLowerCase();

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      price,
      category_id: form.category_id || null,
      image_url: form.image_url.trim() || null,
      badge: form.badge.trim() || null,
    };
    const res = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);

    if (res.error) {
      toast.error("تعذّر الحفظ — تأكد أن الرابط المختصر غير مكرر");
      return;
    }
    toast.success(editing ? "تم تحديث الطبق" : "تمت إضافة الطبق");
    setForm(empty);
    setEditing(null);
    refresh();
  }

  async function remove(product: Product) {
    if (!confirm(`حذف "${product.name}" نهائيًا؟`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) toast.error("تعذّر الحذف — قد يكون مرتبطًا بطلبات سابقة");
    else {
      toast.success("تم الحذف");
      refresh();
    }
  }

  function startEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: String(product.price),
      category_id: product.category_id ?? "",
      image_url: product.image_url ?? "",
      badge: product.badge ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const field =
    "mt-1 w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-saffron/60";

  return (
    <div>
      <h1 className="font-head text-2xl font-black">القائمة</h1>

      <form onSubmit={save} className="mt-5 rounded-2xl border border-line bg-panel/70 p-5">
        <h2 className="font-head text-lg font-bold">
          {editing ? `تعديل: ${editing.name}` : "إضافة طبق جديد"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs text-faint">
            الاسم
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value.slice(0, 100) })}
              required
              className={field}
            />
          </label>
          <label className="text-xs text-faint">
            السعر
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              inputMode="decimal"
              className={field}
            />
          </label>
          <label className="text-xs text-faint">
            القسم
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className={field}
            >
              <option value="">بدون قسم</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-faint">
            رابط الصورة
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value.slice(0, 300) })}
              dir="ltr"
              className={`${field} text-right`}
            />
          </label>
          <label className="text-xs text-faint">
            شارة (اختياري)
            <input
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value.slice(0, 30) })}
              className={field}
            />
          </label>
          <label className="text-xs text-faint">
            الرابط المختصر
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.slice(0, 80) })}
              dir="ltr"
              className={`${field} text-right`}
            />
          </label>
          <label className="text-xs text-faint sm:col-span-2 lg:col-span-3">
            الوصف
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 500) })}
              rows={2}
              className={field}
            />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            disabled={saving}
            className="rounded-xl gradient-warm px-5 py-2.5 font-head text-sm font-bold text-ink disabled:opacity-60"
          >
            {editing ? "حفظ التعديل" : "إضافة"}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
              className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold"
            >
              إلغاء
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-6 grid gap-2">
        {products.map((p) => (
          <article
            key={p.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel/70 p-3"
          >
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                loading="lazy"
                width={96}
                height={96}
                className="size-12 rounded-lg object-cover"
              />
            ) : null}
            <div className="min-w-40 flex-1">
              <p className="font-head text-sm font-bold">{p.name}</p>
              <p className="text-xs text-faint">
                {money(p.price)} {CURRENCY} ·{" "}
                {categories.find((c) => c.id === p.category_id)?.name ?? "بدون قسم"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(
                [
                  ["is_available", "متوفر"],
                  ["is_featured", "مميز"],
                  ["is_popular", "الأكثر طلبًا"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => toggle(p, key)}
                  className={`rounded-lg border px-3 py-1.5 font-semibold ${
                    p[key] ? "border-mint/50 bg-mint/10 text-mint" : "border-line text-faint"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => startEdit(p)}
                className="rounded-lg border border-saffron/40 px-3 py-1.5 font-semibold text-saffron"
              >
                تعديل
              </button>
              <button
                onClick={() => remove(p)}
                className="rounded-lg border border-destructive/40 px-3 py-1.5 font-semibold text-destructive"
              >
                حذف
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
