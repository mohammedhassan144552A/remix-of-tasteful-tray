import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { getOpenState, type BusinessHour } from "./hours";
import { normalizeSaudiPhone, isValidMapUrl } from "./format";

const itemSchema = z.object({
  productId: z.string().uuid(),
  sizeId: z.string().uuid().nullable().optional(),
  extraIds: z.array(z.string().uuid()).max(20).default([]),
  quantity: z.number().int().min(1).max(50),
  notes: z.string().max(300).default(""),
});

const orderSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(9).max(20),
  notes: z.string().trim().max(500).default(""),
  fulfillment: z.enum(["pickup", "delivery"]),
  zoneId: z.string().uuid().nullable().optional(),
  locationUrl: z.string().trim().max(500).nullable().optional(),
  addressText: z.string().trim().max(300).nullable().optional(),
  addressNotes: z.string().trim().max(300).nullable().optional(),
  couponCode: z.string().trim().max(40).nullable().optional(),
  clientToken: z.string().min(8).max(80),
  items: z.array(itemSchema).min(1).max(60),
});

async function currentUserId(): Promise<string | null> {
  const header = getRequestHeader("authorization");
  const token = header?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await client.auth.getUser(token);
  return data.user?.id ?? null;
}

type CouponRow = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_total: number;
  max_discount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
};

function evaluateCoupon(
  coupon: CouponRow | null,
  subtotal: number,
): { ok: boolean; discount: number; message: string } {
  if (!coupon) return { ok: false, discount: 0, message: "الكوبون غير موجود" };
  if (!coupon.is_active) return { ok: false, discount: 0, message: "الكوبون غير مفعّل" };
  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now)
    return { ok: false, discount: 0, message: "الكوبون لم يبدأ بعد" };
  if (coupon.ends_at && new Date(coupon.ends_at).getTime() < now)
    return { ok: false, discount: 0, message: "انتهت صلاحية الكوبون" };
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit)
    return { ok: false, discount: 0, message: "تم استنفاد عدد استخدامات الكوبون" };
  if (subtotal < Number(coupon.min_order_total))
    return {
      ok: false,
      discount: 0,
      message: `الحد الأدنى لاستخدام الكوبون ${coupon.min_order_total} ر.س`,
    };

  let discount =
    coupon.discount_type === "percentage"
      ? (subtotal * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);
  if (coupon.max_discount != null) discount = Math.min(discount, Number(coupon.max_discount));
  discount = Math.min(Math.round(discount * 100) / 100, subtotal);
  return { ok: true, discount, message: "تم تطبيق الكوبون" };
}

/** يحسب الطلب بالكامل من قاعدة البيانات — لا يثق بأي سعر قادم من المتصفح */
async function priceOrder(input: z.infer<typeof orderSchema>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const sizeIds = [
    ...new Set(input.items.map((i) => i.sizeId).filter((v): v is string => !!v)),
  ];
  const extraIds = [...new Set(input.items.flatMap((i) => i.extraIds))];

  const [settingsRes, hoursRes, productsRes, sizesRes, extrasRes] = await Promise.all([
    supabaseAdmin.from("restaurant_settings").select("*").eq("id", 1).maybeSingle(),
    supabaseAdmin.from("business_hours").select("*"),
    supabaseAdmin.from("products").select("*").in("id", productIds),
    sizeIds.length
      ? supabaseAdmin.from("product_sizes").select("*").in("id", sizeIds)
      : Promise.resolve({ data: [] as never[], error: null }),
    extraIds.length
      ? supabaseAdmin.from("product_extras").select("*").in("id", extraIds)
      : Promise.resolve({ data: [] as never[], error: null }),
  ]);

  const settings = settingsRes.data;
  if (!settings) throw new Error("تعذّر قراءة إعدادات المطعم");
  if (!settings.orders_enabled) throw new Error("الطلبات متوقفة مؤقتًا");

  const open = getOpenState((hoursRes.data ?? []) as BusinessHour[]);
  if (!open.isOpen && !settings.allow_order_when_closed) {
    throw new Error(`المطعم مغلق حاليًا (${open.label}) — لا يمكن استقبال الطلبات الآن`);
  }
  if (input.fulfillment === "pickup" && !settings.pickup_enabled)
    throw new Error("الاستلام من الفرع غير متاح حاليًا");
  if (input.fulfillment === "delivery" && !settings.delivery_enabled)
    throw new Error("التوصيل غير متاح حاليًا");

  const products = productsRes.data ?? [];
  const sizes = (sizesRes.data ?? []) as { id: string; product_id: string; name: string; price: number; is_active: boolean }[];
  const extras = (extrasRes.data ?? []) as { id: string; product_id: string; name: string; price: number; is_active: boolean }[];

  let subtotal = 0;
  let itemsCount = 0;
  const rows = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error("أحد المنتجات لم يعد موجودًا");
    if (!product.is_available) throw new Error(`المنتج "${product.name}" غير متوفر حاليًا`);

    let unitPrice = Number(product.price);
    let sizeName: string | null = null;
    if (item.sizeId) {
      const size = sizes.find((s) => s.id === item.sizeId && s.product_id === product.id);
      if (!size || !size.is_active) throw new Error(`الحجم المختار لـ "${product.name}" غير متاح`);
      unitPrice = Number(size.price);
      sizeName = size.name;
    }

    const chosenExtras = item.extraIds.map((id) => {
      const extra = extras.find((e) => e.id === id && e.product_id === product.id);
      if (!extra || !extra.is_active) throw new Error(`إحدى الإضافات لـ "${product.name}" غير متاحة`);
      return { id: extra.id, name: extra.name, price: Number(extra.price) };
    });

    const extrasTotal = chosenExtras.reduce((s, e) => s + e.price, 0);
    const lineTotal = (unitPrice + extrasTotal) * item.quantity;
    subtotal += lineTotal;
    itemsCount += item.quantity;

    return {
      product_id: product.id,
      product_name: product.name,
      product_image: product.image_url,
      size_name: sizeName,
      unit_price: unitPrice,
      quantity: item.quantity,
      extras: chosenExtras,
      notes: item.notes || null,
      line_total: lineTotal,
    };
  });

  subtotal = Math.round(subtotal * 100) / 100;

  let deliveryFee = 0;
  let zoneName: string | null = null;
  if (input.fulfillment === "delivery") {
    if (!input.zoneId) throw new Error("اختر منطقة التوصيل");
    const zone = await supabaseAdmin
      .from("delivery_zones")
      .select("*")
      .eq("id", input.zoneId)
      .maybeSingle();
    if (!zone.data || !zone.data.is_active) throw new Error("منطقة التوصيل غير متاحة");
    if (subtotal < Number(zone.data.min_order_total))
      throw new Error(
        `الحد الأدنى للطلب في ${zone.data.name} هو ${zone.data.min_order_total} ر.س`,
      );
    zoneName = zone.data.name;
    deliveryFee = Number(zone.data.delivery_fee);
    if (
      settings.free_delivery_threshold != null &&
      subtotal >= Number(settings.free_delivery_threshold)
    ) {
      deliveryFee = 0;
    }
    if (!input.locationUrl || !isValidMapUrl(input.locationUrl))
      throw new Error("أدخل رابط موقع صحيح من خرائط Google");
  }

  if (subtotal < Number(settings.min_order_total))
    throw new Error(`الحد الأدنى للطلب هو ${settings.min_order_total} ر.س`);

  let discount = 0;
  let couponCode: string | null = null;
  let couponId: string | null = null;
  if (input.couponCode) {
    const res = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", input.couponCode.toUpperCase())
      .maybeSingle();
    const evaluated = evaluateCoupon(res.data as CouponRow | null, subtotal);
    if (!evaluated.ok) throw new Error(evaluated.message);
    discount = evaluated.discount;
    couponCode = (res.data as CouponRow).code;
    couponId = (res.data as CouponRow).id;
  }

  const total = Math.round((subtotal - discount + deliveryFee) * 100) / 100;
  return { settings, rows, subtotal, itemsCount, deliveryFee, zoneName, discount, couponCode, couponId, total };
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const phone = normalizeSaudiPhone(data.phone);
    if (!phone) throw new Error("رقم الجوال غير صحيح — استخدم صيغة 05XXXXXXXX");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // منع الطلبات المكررة
    const existing = await supabaseAdmin
      .from("orders")
      .select("id, order_number")
      .eq("client_token", data.clientToken)
      .maybeSingle();
    if (existing.data) return { orderNumber: existing.data.order_number, duplicate: true };

    const priced = await priceOrder(data);
    const userId = await currentUserId();

    const branch = await supabaseAdmin
      .from("branches")
      .select("id")
      .eq("is_active", true)
      .order("sort_order")
      .limit(1)
      .maybeSingle();

    const orderRes = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: data.name,
        customer_phone: phone,
        notes: data.notes || null,
        fulfillment: data.fulfillment,
        branch_id: branch.data?.id ?? null,
        delivery_zone_id: data.fulfillment === "delivery" ? (data.zoneId ?? null) : null,
        delivery_zone_name: priced.zoneName,
        delivery_fee: priced.deliveryFee,
        location_url: data.fulfillment === "delivery" ? (data.locationUrl ?? null) : null,
        address_text: data.addressText || null,
        address_notes: data.addressNotes || null,
        items_count: priced.itemsCount,
        subtotal: priced.subtotal,
        discount: priced.discount,
        coupon_code: priced.couponCode,
        total: priced.total,
        status: "new",
        client_token: data.clientToken,
      })
      .select("id, order_number")
      .single();

    if (orderRes.error) throw new Error("تعذّر حفظ الطلب، حاول مرة أخرى");

    const itemsRes = await supabaseAdmin
      .from("order_items")
      .insert(priced.rows.map((r) => ({ ...r, order_id: orderRes.data.id })));
    if (itemsRes.error) {
      await supabaseAdmin.from("orders").delete().eq("id", orderRes.data.id);
      throw new Error("تعذّر حفظ تفاصيل الطلب، حاول مرة أخرى");
    }

    if (priced.couponId) {
      await supabaseAdmin.from("coupon_usages").insert({
        coupon_id: priced.couponId,
        user_id: userId,
        phone,
        order_id: orderRes.data.id,
      });
      const current = await supabaseAdmin
        .from("coupons")
        .select("used_count")
        .eq("id", priced.couponId)
        .single();
      await supabaseAdmin
        .from("coupons")
        .update({ used_count: Number(current.data?.used_count ?? 0) + 1 })
        .eq("id", priced.couponId);
    }

    if (userId) {
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        order_id: orderRes.data.id,
        title: `تم استلام طلبك #${orderRes.data.order_number}`,
        body: "سنبدأ التجهيز فور تأكيد الفرع.",
      });
    }

    return { orderNumber: orderRes.data.order_number, duplicate: false };
  });

export const checkCoupon = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ code: z.string().trim().min(1).max(40), subtotal: z.number().min(0) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const res = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .maybeSingle();
    return evaluateCoupon(res.data as CouponRow | null, data.subtotal);
  });

export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ orderNumber: z.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const order = await supabaseAdmin
      .from("orders")
      .select(
        "order_number, status, total, subtotal, discount, delivery_fee, fulfillment, delivery_zone_name, customer_name, created_at, items_count",
      )
      .eq("order_number", data.orderNumber)
      .maybeSingle();
    if (!order.data) return null;
    const items = await supabaseAdmin
      .from("order_items")
      .select("product_name, size_name, quantity, unit_price, line_total, extras, notes")
      .eq(
        "order_id",
        (
          await supabaseAdmin
            .from("orders")
            .select("id")
            .eq("order_number", data.orderNumber)
            .single()
        ).data!.id,
      );
    return { order: order.data, items: items.data ?? [] };
  });

export const trackVisit = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const today = new Date().toISOString().slice(0, 10);
  const existing = await supabaseAdmin
    .from("site_visits")
    .select("id, count")
    .eq("visit_date", today)
    .maybeSingle();
  if (existing.data) {
    await supabaseAdmin
      .from("site_visits")
      .update({ count: existing.data.count + 1 })
      .eq("id", existing.data.id);
  } else {
    await supabaseAdmin.from("site_visits").insert({ visit_date: today, count: 1 });
  }
  return { ok: true };
});
