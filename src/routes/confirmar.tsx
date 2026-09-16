import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MessageSquareText, ReceiptText } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { COP, getDeveloper } from "@/lib/developers";

const searchSchema = z.object({
  dev: z.string().default(""),
  slot: z.string().default(""),
});

export const Route = createFileRoute("/confirmar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Confirmar reserva — Consulta Ya" },
      {
        name: "description",
        content: "Revisa el resumen de tu consulta técnica y confirma tu reserva.",
      },
      { property: "og:title", content: "Confirmar reserva — Consulta Ya" },
      {
        property: "og:description",
        content: "Revisa el resumen de tu consulta técnica y confirma tu reserva.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfirmBooking,
});

function ConfirmBooking() {
  const { dev: devId, slot: slotId } = Route.useSearch();
  const navigate = useNavigate();
  const dev = getDeveloper(devId);
  const slot = dev?.slots.find((s) => s.id === slotId);
  const [problem, setProblem] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  if (!dev || !slot) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-background px-5 text-center">
        <p className="text-lg font-bold text-foreground">Esta reserva no es válida</p>
        <p className="mt-2 text-sm text-muted-foreground">
          El horario que buscas ya no está disponible o el enlace está incompleto.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-2xl bg-navy px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const commission = Math.round(slot.price * 0.15);
  const total = slot.price + commission;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-10">
      <header className="rounded-b-3xl bg-navy px-5 pb-8 pt-6 text-primary-foreground">
        <button
          onClick={() => navigate({ to: "/experto/$id", params: { id: dev.id } })}
          className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </button>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Confirma tu reserva</h1>
        <p className="mt-1 text-sm text-primary-foreground/75">
          Revisa los detalles antes de agendar tu consulta.
        </p>
      </header>

      <div className="space-y-5 px-5 pt-6">
        {/* Summary */}
        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <img
              src={dev.photo}
              alt={`Foto de ${dev.name}`}
              width={816}
              height={816}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-success/20"
            />
            <div>
              <p className="font-bold text-foreground">{dev.name}</p>
              <p className="text-xs font-semibold text-navy/70">{dev.specialty}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-secondary p-3 text-center">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Fecha</p>
              <p className="text-sm font-bold text-foreground">{slot.day}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Hora</p>
              <p className="text-sm font-bold text-foreground">
                {slot.label.replace(/^(Hoy|Mañana)\s/, "")}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Duración</p>
              <p className="text-sm font-bold text-foreground">{slot.duration} min</p>
            </div>
          </div>
        </section>

        {/* Price breakdown */}
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ReceiptText className="h-4 w-4 text-navy" />
            Desglose del pago
          </h2>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Valor de la consulta</dt>
              <dd className="font-semibold text-foreground">{COP(slot.price)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Comisión de la plataforma (15%)</dt>
              <dd className="font-semibold text-foreground">{COP(commission)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2.5">
              <dt className="font-bold text-foreground">Total a pagar</dt>
              <dd className="text-base font-extrabold text-navy">{COP(total)}</dd>
            </div>
          </dl>
        </section>

        {/* Problem description */}
        <section className="rounded-3xl border border-border bg-card p-5">
          <label
            htmlFor="problem"
            className="flex items-center gap-2 text-sm font-bold text-foreground"
          >
            <MessageSquareText className="h-4 w-4 text-navy" />
            Cuéntanos tu problema técnico
          </label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={4}
            placeholder="Ej: mi despliegue falla y no entiendo el error"
            className="mt-3 w-full resize-none rounded-2xl border border-border bg-background p-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-success focus:ring-2 focus:ring-success/30"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Mientras más contexto des, más rápido te ayuda el experto.
          </p>
        </section>

        <button
          onClick={() => setConfirmed(true)}
          className="w-full rounded-2xl bg-success py-4 text-base font-extrabold text-success-foreground shadow-lg shadow-success/25 transition-transform active:scale-[0.98]"
        >
          Confirmar reserva · {COP(total)}
        </button>

        <Link
          to="/"
          className="block pb-2 text-center text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Cancelar y volver al inicio
        </Link>
      </div>

      {/* Confirmation modal */}
      {confirmed && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Reserva confirmada"
        >
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-9 w-9 text-success" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-foreground">¡Reserva confirmada!</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tu consulta con <span className="font-bold text-foreground">{dev.name}</span> quedó
              agendada para <span className="font-bold text-foreground">{slot.label}</span> (
              {slot.duration} min).
            </p>
            <div className="mt-4 rounded-2xl bg-secondary p-4 text-left text-sm text-muted-foreground">
              <p className="font-bold text-foreground">¿Qué sigue?</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                <li>Te llegará un correo con el enlace de la videollamada.</li>
                <li>Ten a la mano el error y el código relacionado.</li>
                <li>Conéctate 5 minutos antes de la hora agendada.</li>
              </ol>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              (Simulación: no se realizó ningún pago real.)
            </p>
            <Link
              to="/"
              className="mt-5 block w-full rounded-2xl bg-navy py-3.5 text-sm font-extrabold text-primary-foreground"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
