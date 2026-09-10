import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | مطعم مزّة" },
      {
        name: "description",
        content: "سجّل دخولك لحفظ عناوينك ومتابعة طلباتك السابقة والمفضلة.",
      },
      { property: "og:title", content: "تسجيل الدخول | مطعم مزّة" },
      { property: "og:description", content: "حساب واحد لكل طلباتك." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function safeNext(next?: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const target = safeNext(next);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: target, replace: true });
    });
  }, [navigate, target]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${target}`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      void navigate({ to: target, replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذّر إتمام العملية");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(target)}`,
    });
    if (result.error) {
      toast.error("تعذّر تسجيل الدخول عبر Google");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: target, replace: true });
  }

  const field =
    "mt-1 w-full rounded-xl border border-line bg-panel/70 px-4 py-3 text-sm outline-none focus:border-saffron/60";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="font-head text-3xl font-black">
          {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
        </h1>
        <p className="mt-2 text-sm text-faint">
          احفظ عناوينك وتابع طلباتك السابقة بسهولة.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-6 w-full rounded-xl border border-line bg-panel/70 px-4 py-3 text-sm font-bold"
        >
          المتابعة عبر Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-faint">
          <span className="h-px flex-1 bg-border" />
          أو
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          {mode === "signup" ? (
            <div>
              <label htmlFor="fn" className="text-xs text-faint">الاسم</label>
              <input
                id="fn"
                value={fullName}
                onChange={(e) => setFullName(e.target.value.slice(0, 80))}
                required
                className={field}
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="em" className="text-xs text-faint">البريد الإلكتروني</label>
            <input
              id="em"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, 255))}
              required
              className={`${field} text-right`}
            />
          </div>
          <div>
            <label htmlFor="pw" className="text-xs text-faint">كلمة المرور</label>
            <input
              id="pw"
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className={`${field} text-right`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl gradient-warm px-6 py-3.5 font-head font-bold text-ink disabled:opacity-60"
          >
            {loading ? "لحظة…" : mode === "signin" ? "دخول" : "إنشاء الحساب"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-sm text-saffron"
        >
          {mode === "signin" ? "ليس لديك حساب؟ أنشئ واحدًا" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </div>
    </SiteLayout>
  );
}
