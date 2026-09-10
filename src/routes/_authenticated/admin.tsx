import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuroraBackground } from "@/components/aurora-background";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | مدة" },
      { name: "description", content: "إدارة الطلبات والقائمة والعروض والإعدادات." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "لوحة القيادة", exact: true },
  { to: "/admin/orders", label: "الطلبات", exact: false },
  { to: "/admin/menu", label: "القائمة", exact: false },
  { to: "/admin/promotions", label: "العروض والكوبونات", exact: false },
  { to: "/admin/zones", label: "مناطق التوصيل", exact: false },
  { to: "/admin/settings", label: "الإعدادات", exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isStaff, isLoading } = useQuery({
    queryKey: ["is-staff"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_staff");
      if (error) throw new Error(error.message);
      return Boolean(data);
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-faint">جارِ التحقق…</div>;
  }

  if (!isStaff) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="font-head text-2xl font-black">غير مصرّح لك</h1>
          <p className="mt-2 text-sm text-faint">هذه الصفحة مخصصة لفريق المطعم فقط.</p>
          <Link to="/" className="mt-5 inline-block text-sm font-bold text-saffron">
            العودة للموقع
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AuroraBackground />
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link to="/admin" className="font-head text-lg font-extrabold">
            لوحة الإدارة
          </Link>
          <Link to="/" className="text-xs text-faint hover:text-saffron">
            عرض الموقع ↗
          </Link>
          <ThemeToggle />
          <button onClick={signOut} className="mr-auto text-xs text-faint hover:text-destructive">
            خروج
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              activeProps={{ className: "bg-saffron text-ink" }}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-soft"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
