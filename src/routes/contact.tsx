import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { settingsQuery, branchesQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | مطعم مزّة" },
      {
        name: "description",
        content: "أرقام التواصل، الواتساب، البريد، وموقع فرع مطعم مزّة في الرياض.",
      },
      { property: "og:title", content: "تواصل معنا | مطعم مزّة" },
      { property: "og:description", content: "نسعد بخدمتك — تواصل معنا في أي وقت." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: branches = [] } = useQuery(branchesQuery);
  const main = branches[0];
  const mapUrl = settings?.map_url ?? main?.map_url ?? null;

  const cards = [
    settings?.phone
      ? { icon: Phone, label: "اتصال", value: settings.phone, href: `tel:${settings.phone}` }
      : null,
    settings?.whatsapp
      ? {
          icon: MessageCircle,
          label: "واتساب",
          value: settings.whatsapp,
          href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
        }
      : null,
    settings?.email
      ? { icon: Mail, label: "البريد", value: settings.email, href: `mailto:${settings.email}` }
      : null,
    settings?.address
      ? { icon: MapPin, label: "العنوان", value: settings.address, href: mapUrl }
      : null,
  ].filter(Boolean) as {
    icon: typeof Phone;
    label: string;
    value: string;
    href: string | null;
  }[];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-head text-3xl font-black sm:text-4xl">تواصل معنا</h1>
        <p className="mt-3 text-sm text-faint">
          لأي استفسار عن طلبك أو ملاحظة على الخدمة، نحن هنا.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {cards.map((c) => {
            const content = (
              <>
                <c.icon className="size-5 text-saffron" />
                <p className="mt-3 text-xs text-faint">{c.label}</p>
                <p className="mt-1 font-head font-bold" dir="auto">
                  {c.value}
                </p>
              </>
            );
            return c.href ? (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="rounded-2xl border border-line bg-panel/70 p-5 transition-colors hover:border-saffron/50"
              >
                {content}
              </a>
            ) : (
              <div key={c.label} className="rounded-2xl border border-line bg-panel/70 p-5">
                {content}
              </div>
            );
          })}
        </div>

        {mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-xl gradient-warm px-6 py-3.5 font-head font-bold text-ink"
          >
            افتح الموقع على الخريطة
          </a>
        ) : null}
      </div>
    </SiteLayout>
  );
}
