import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Clock, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { COP, developers, SPECIALTIES } from "@/lib/developers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Consulta Ya — Expertos que desbloquean tu código en minutos" },
      {
        name: "description",
        content:
          "Soluciona en 20 minutos ese error técnico que te tiene frenado. Consultas de 15 a 30 minutos con desarrolladores expertos en Colombia.",
      },
      { property: "og:title", content: "Consulta Ya — Expertos que desbloquean tu código en minutos" },
      {
        property: "og:description",
        content:
          "Consultas técnicas de 15 a 30 minutos con desarrolladores expertos. React, bases de datos, DevOps y WordPress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string>("Todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return developers.filter((d) => {
      const matchesSpecialty = specialty === "Todos" || d.specialty.includes(specialty);
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.tech.some((t) => t.toLowerCase().includes(q));
      return matchesSpecialty && matchesQuery;
    });
  }, [query, specialty]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-10">
      {/* Header navy */}
      <header className="rounded-b-3xl bg-navy px-5 pb-8 pt-10 text-primary-foreground">
        <p className="text-sm font-medium text-primary-foreground/70">
          Bienvenido a Consulta ya, ¿qué error te tiene frenado hoy?
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          Consulta <span className="text-success">Ya</span>
        </h1>
        <p className="mt-3 text-base leading-relaxed text-primary-foreground/85">
          Soluciona en 20 minutos ese error técnico que te tiene frenado.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-primary-foreground/70">
          <Zap className="h-3.5 w-3.5 text-success" />
          Sesiones de 15 a 30 minutos con expertos verificados
        </div>
      </header>

      {/* Search */}
      <div className="px-5">
        <div className="relative -mt-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca por especialidad o tecnología…"
            className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm shadow-lg shadow-navy/5 outline-none placeholder:text-muted-foreground focus:border-success focus:ring-2 focus:ring-success/30"
          />
        </div>

        {/* Quick filters */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                specialty === s
                  ? "bg-navy text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:border-navy/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Developer list */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Disponibles hoy</h2>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" />
            {filtered.length} expertos
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {filtered.map((dev) => (
            <Link
              key={dev.id}
              to="/experto/$id"
              params={{ id: dev.id }}
              className="block rounded-3xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <img
                  src={dev.photo}
                  alt={`Foto de ${dev.name}`}
                  loading="lazy"
                  width={816}
                  height={816}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-success/20"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-foreground">{dev.name}</h3>
                      <p className="text-xs font-semibold text-navy/70">{dev.specialty}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-lavender/10 px-2.5 py-1 text-[11px] font-bold text-lavender">
                      Disponible hoy
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{dev.shortBio}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">
                      Desde {COP(dev.priceFrom)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {dev.slots[0]?.duration ?? 30} min
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No encontramos expertos para esa búsqueda. Intenta con otra especialidad.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
