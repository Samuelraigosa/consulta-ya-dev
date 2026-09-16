import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Clock } from "lucide-react";
import { COP, getDeveloper } from "@/lib/developers";

export const Route = createFileRoute("/experto/$id")({
  loader: ({ params }) => {
    const dev = getDeveloper(params.id);
    if (!dev) throw notFound();
    return { dev };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.dev.name ?? "Experto"} — Consulta Ya` },
      {
        name: "description",
        content: loaderData?.dev.shortBio ?? "Perfil de experto en Consulta Ya.",
      },
      { property: "og:title", content: `${loaderData?.dev.name ?? "Experto"} — Consulta Ya` },
      { property: "og:description", content: loaderData?.dev.shortBio ?? "" },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeveloperProfile,
});

function DeveloperProfile() {
  const { dev } = Route.useLoaderData();
  const navigate = useNavigate();
  const today = dev.slots.filter((s) => s.day === "Hoy");
  const tomorrow = dev.slots.filter((s) => s.day === "Mañana");

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-10">
      {/* Header */}
      <header className="rounded-b-3xl bg-navy px-5 pb-16 pt-6 text-primary-foreground">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </header>

      {/* Profile card */}
      <div className="px-5">
        <div className="-mt-12 rounded-3xl border border-border bg-card p-5 shadow-lg shadow-navy/5">
          <div className="flex items-center gap-4">
            <img
              src={dev.photo}
              alt={`Foto de ${dev.name}`}
              width={816}
              height={816}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-success/20"
            />
            <div>
              <h1 className="text-xl font-extrabold text-foreground">{dev.name}</h1>
              <p className="text-sm font-semibold text-navy/70">{dev.specialty}</p>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-lavender/10 px-2.5 py-1 text-[11px] font-bold text-lavender">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Disponible hoy
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{dev.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {dev.tech.map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Slots */}
        <SlotSection
          title="Hoy"
          slots={today}
          onSelect={(slotId) =>
            navigate({ to: "/confirmar", search: { dev: dev.id, slot: slotId } })
          }
        />
        <SlotSection
          title="Mañana"
          slots={tomorrow}
          onSelect={(slotId) =>
            navigate({ to: "/confirmar", search: { dev: dev.id, slot: slotId } })
          }
        />

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <CalendarClock className="h-4 w-4 text-success" />
          El pago se realiza de forma segura al confirmar la reserva.
        </p>
      </div>
    </div>
  );
}

function SlotSection({
  title,
  slots,
  onSelect,
}: {
  title: string;
  slots: { id: string; label: string; duration: number; price: number }[];
  onSelect: (slotId: string) => void;
}) {
  if (slots.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => onSelect(slot.id)}
            className="group rounded-2xl border border-border bg-card p-3.5 text-left transition-all hover:border-success hover:ring-2 hover:ring-success/30 active:scale-[0.98]"
          >
            <p className="text-sm font-bold text-foreground group-hover:text-success">
              {slot.label}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {slot.duration} min
            </p>
            <p className="mt-1.5 text-sm font-extrabold text-navy">{COP(slot.price)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
