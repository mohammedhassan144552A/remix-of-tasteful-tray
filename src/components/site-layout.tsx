import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { AuroraBackground } from "./aurora-background";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/lib/cart";
import { settingsQuery, hoursQuery } from "@/lib/queries";
import { getOpenState } from "@/lib/hours";
import { supabase } from "@/integrations/supabase/client";
import { money, CURRENCY } from "@/lib/format";

const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/menu", label: "القائمة" },
  { to: "/track", label: "تتبع الطلب" },
  { to: "/about", label: "عن المطعم" },
  { to: "/contact", label: "تواصل معنا" },
  { to: "/faq", label: "الأسئلة" },
] as const;

function useSession() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setEmail(data.session?.user.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return email;
}

export function SiteHeader() {
  const { count, subtotal } = useCart();
  const [open, setOpen] = useState(false);
  const email = useSession();
  const { data: settings } = useQuery(settingsQuery);
  const { data: hours } = useQuery(hoursQuery);
  const state = getOpenState(hours ?? []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl gradient-warm font-head text-lg font-black text-ink">
            م
          </span>
          <span className="font-head text-lg font-extrabold">{settings?.name ?? "مدة"}</span>
        </Link>

        <span
          className={`hidden rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${
            state.isOpen
              ? "border-mint/40 bg-mint/10 text-mint"
              : "border-line bg-panel text-faint"
          }`}
        >
          {state.label}
        </span>

        <nav className="mr-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-saffron bg-panel" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-soft transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mr-auto flex items-center gap-2 lg:mr-0">
          <ThemeToggle />
          <Link
            to={email ? "/account" : "/auth"}
            className="grid size-10 place-items-center rounded-xl border border-line bg-panel/70 text-soft transition-colors hover:text-saffron"
            aria-label={email ? "حسابي" : "تسجيل الدخول"}
          >
            <User className="size-4.5" />
          </Link>
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-xl gradient-warm px-3 py-2.5 font-head text-sm font-bold text-ink"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">
              {count > 0 ? `${money(subtotal)} ${CURRENCY}` : "السلة"}
            </span>
            {count > 0 ? (
              <span className="absolute -top-1.5 -left-1.5 grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-saffron">
                {count}
              </span>
            ) : null}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-xl border border-line bg-panel/70 lg:hidden"
            aria-label="القائمة"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-line bg-panel/95 px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-saffron" }}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-soft"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: hours } = useQuery(hoursQuery);
  const state = getOpenState(hours ?? []);

  return (
    <footer className="mt-20 border-t border-line bg-panel2/80 shadow-[0_-18px_50px_-35px_var(--saffron)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-head text-lg font-extrabold">{settings?.name ?? "مدة"}</h3>
          <p className="mt-2 text-sm leading-relaxed text-faint">
            {settings?.tagline ?? "أرز ومشاوي وطعم بيتي أصيل."}
          </p>
          <p className="mt-3 text-xs text-faint">{state.label}</p>
        </div>
        <div>
          <h4 className="font-head text-sm font-bold">روابط</h4>
          <div className="mt-3 grid gap-2 text-sm text-faint">
            <Link to="/menu" className="hover:text-saffron">القائمة</Link>
            <Link to="/track" className="hover:text-saffron">تتبع الطلب</Link>
            <Link to="/about" className="hover:text-saffron">عن المطعم</Link>
            <Link to="/faq" className="hover:text-saffron">الأسئلة الشائعة</Link>
          </div>
        </div>
        <div>
          <h4 className="font-head text-sm font-bold">تواصل</h4>
          <div className="mt-3 grid gap-2 text-sm text-faint">
            {settings?.phone ? (
              <a href={`tel:${settings.phone}`} dir="ltr" className="text-right hover:text-saffron">
                {settings.phone}
              </a>
            ) : null}
            {settings?.whatsapp ? (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-saffron"
              >
                واتساب
              </a>
            ) : null}
            <Link to="/contact" className="hover:text-saffron">نموذج التواصل</Link>
          </div>
        </div>
        <div>
          <h4 className="font-head text-sm font-bold">قانوني</h4>
          <div className="mt-3 grid gap-2 text-sm text-faint">
            <Link to="/policies" className="hover:text-saffron">سياسة الطلب والاسترجاع</Link>
            <Link to="/policies" className="hover:text-saffron">سياسة الخصوصية</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-faint">
        {settings?.footer_text ?? `© ${new Date().getFullYear()} جميع الحقوق محفوظة`}
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AuroraBackground />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
