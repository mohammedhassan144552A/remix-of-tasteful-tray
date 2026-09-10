import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { normalizeSaudiPhone } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "حسابي | مطعم مزّة" },
      { name: "description", content: "بياناتك الشخصية وطلباتك ومفضلتك." },
      { property: "og:title", content: "حسابي | مطعم مزّة" },
      { property: "og:description", content: "إدارة حسابك في مطعم مزّة." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const res = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
      return { email: auth.user.email ?? "", id: auth.user.id, profile: res.data };
    },
  });

  useEffect(() => {
    if (profile?.profile) {
      setFullName(profile.profile.full_name ?? "");
      setPhone(profile.profile.phone ?? "");
    }
  }, [profile]);

  useEffect(() => {
    supabase.rpc("is_staff").then(({ data }) => setIsStaff(Boolean(data)));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const normalized = phone ? normalizeSaudiPhone(phone) : null;
    if (phone && !normalized) return toast.error("رقم الجوال غير صحيح");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: profile.id, full_name: fullName.trim(), phone: normalized });
    setSaving(false);
    if (error) toast.error("تعذّر الحفظ");
    else toast.success("تم حفظ بياناتك");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  const field =
    "mt-1 w-full rounded-xl border border-line bg-panel/70 px-4 py-3 text-sm outline-none focus:border-saffron/60";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-head text-3xl font-black">حسابي</h1>
        <p className="mt-1 text-sm text-faint" dir="ltr">
          {profile?.email}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/orders"
            className="rounded-xl border border-line bg-panel/70 px-4 py-2.5 text-sm font-semibold"
          >
            طلباتي
          </Link>
          <Link
            to="/favorites"
            className="rounded-xl border border-line bg-panel/70 px-4 py-2.5 text-sm font-semibold"
          >
            المفضلة
          </Link>
          {isStaff ? (
            <Link
              to="/admin"
              className="rounded-xl gradient-warm px-4 py-2.5 text-sm font-bold text-ink"
            >
              لوحة الإدارة
            </Link>
          ) : null}
        </div>

        <form onSubmit={save} className="mt-8 rounded-2xl border border-line bg-panel/70 p-5">
          <h2 className="font-head text-lg font-bold">البيانات الشخصية</h2>
          <div className="mt-4 grid gap-3">
            <div>
              <label htmlFor="fn" className="text-xs text-faint">الاسم</label>
              <input
                id="fn"
                value={fullName}
                onChange={(e) => setFullName(e.target.value.slice(0, 80))}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="ph" className="text-xs text-faint">الجوال</label>
              <input
                id="ph"
                value={phone}
                onChange={(e) => setPhone(e.target.value.slice(0, 20))}
                dir="ltr"
                placeholder="05XXXXXXXX"
                className={`${field} text-right`}
              />
            </div>
          </div>
          <button
            disabled={saving}
            className="mt-4 rounded-xl gradient-warm px-6 py-3 font-head font-bold text-ink disabled:opacity-60"
          >
            {saving ? "جارِ الحفظ…" : "حفظ"}
          </button>
        </form>

        <button
          onClick={signOut}
          className="mt-6 rounded-xl border border-destructive/40 px-5 py-2.5 text-sm font-semibold text-destructive"
        >
          تسجيل الخروج
        </button>
      </div>
    </SiteLayout>
  );
}
