import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  MessageSquareText,
  Search,
  Trash2,
  User,
  X,
  Check,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/mis-reservas")({
  head: () => ({
    meta: [
      { title: "Mis reservas — Consulta Ya" },
      {
        name: "description",
        content: "Consulta, edita o cancela tus reservas de asesoría técnica en Consulta Ya.",
      },
      { property: "og:title", content: "Mis reservas — Consulta Ya" },
      {
        property: "og:description",
        content: "Consulta, edita o cancela tus reservas de asesoría técnica en Consulta Ya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyBookings,
});

interface BookingItem {
  id: string;
  booking_time: string;
  problem_description: string;
  client_name: string;
  developers: {
    full_name: string;
    specialty: string;
  } | null;
}

function MyBookings() {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState("");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados para edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const timeZone = "America/Bogota";

    const dateFormatted = new Intl.DateTimeFormat("es-CO", {
      timeZone,
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);

    const timeFormatted = new Intl.DateTimeFormat("es-CO", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);

    return { dateFormatted, timeFormatted };
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = clientName.trim();
    if (!query) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setHasSearched(true);

      const { data, error } = await supabase
        .from("bookings")
        .select("id, booking_time, problem_description, client_name, developers(full_name, specialty)")
        .ilike("client_name", query)
        .order("booking_time", { ascending: true });

      if (error) {
        throw error;
      }

      setBookings((data as unknown as BookingItem[]) || []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error al consultar tus reservas.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (booking: BookingItem) => {
    setEditingId(booking.id);
    setEditingText(booking.problem_description);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (bookingId: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;

    try {
      setActionLoadingId(bookingId);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("bookings")
        .update({ problem_description: trimmed })
        .eq("id", bookingId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("No se pudo actualizar la reserva. Permiso denegado o reserva inexistente.");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, problem_description: trimmed } : b))
      );
      setEditingId(null);
      setEditingText("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al actualizar la descripción del problema.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (bookingId: string) => {
    const confirmed = window.confirm("¿Estás seguro de que deseas cancelar esta reserva?");
    if (!confirmed) return;

    try {
      setActionLoadingId(bookingId);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("No se pudo cancelar la reserva. Permiso denegado o reserva inexistente.");
      }

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al cancelar la reserva.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-10">
      <header className="rounded-b-3xl bg-navy px-5 pb-8 pt-6 text-primary-foreground">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Mis reservas</h1>
        <p className="mt-1 text-sm text-primary-foreground/75">
          Ingresa tu nombre para consultar, modificar o cancelar tus sesiones.
        </p>
      </header>

      <div className="space-y-5 px-5 pt-6">
        {/* Formulario de búsqueda */}
        <form onSubmit={handleSearch} className="rounded-3xl border border-border bg-card p-5">
          <label htmlFor="clientName" className="flex items-center gap-2 text-sm font-bold text-foreground">
            <User className="h-4 w-4 text-navy" />
            Tu nombre
          </label>
          <input
            id="clientName"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ej: Santiago Moreno"
            className="mt-3 w-full rounded-2xl border border-border bg-background p-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-success focus:ring-2 focus:ring-success/30"
          />
          <button
            type="submit"
            disabled={loading || !clientName.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-success py-3.5 text-sm font-extrabold text-success-foreground transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {loading ? "Buscando…" : "Buscar mis reservas"}
          </button>
        </form>

        {/* Mensaje de error general */}
        {errorMsg && (
          <p className="rounded-2xl border border-dashed border-red-300 bg-card p-4 text-center text-xs text-red-500">
            {errorMsg}
          </p>
        )}

        {/* Resultados */}
        {loading && (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Cargando tus reservas…
          </p>
        )}

        {!loading && hasSearched && bookings.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No encontramos reservas registradas a nombre de "{clientName.trim()}".
          </p>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">
              Reservas encontradas ({bookings.length})
            </h2>

            {bookings.map((booking) => {
              const { dateFormatted, timeFormatted } = formatDateTime(booking.booking_time);
              const isEditing = editingId === booking.id;
              const isBusy = actionLoadingId === booking.id;

              return (
                <div key={booking.id} className="rounded-3xl border border-border bg-card p-5 space-y-4">
                  {/* Info Experto */}
                  <div>
                    <p className="font-bold text-foreground">
                      {booking.developers?.full_name || "Experto asignado"}
                    </p>
                    <p className="text-xs font-semibold text-navy/70">
                      {booking.developers?.specialty || "Especialidad"}
                    </p>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="flex gap-2 rounded-2xl bg-secondary p-3 text-xs">
                    <div className="flex flex-1 items-center gap-1.5 font-semibold text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-navy shrink-0" />
                      <span className="capitalize">{dateFormatted}</span>
                    </div>
                    <div className="flex flex-1 items-center gap-1.5 font-semibold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-navy shrink-0" />
                      <span>{timeFormatted}</span>
                    </div>
                  </div>

                  {/* Problema / Edición */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <MessageSquareText className="h-3.5 w-3.5 text-navy" />
                      Problema descrito
                    </label>

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                          className="w-full resize-none rounded-2xl border border-border bg-background p-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-success focus:ring-2 focus:ring-success/30"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(booking.id)}
                            disabled={isBusy || !editingText.trim()}
                            className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-success py-2.5 text-xs font-bold text-success-foreground disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            {isBusy ? "Guardando…" : "Guardar"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isBusy}
                            className="flex-1 flex items-center justify-center gap-1 rounded-2xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-foreground bg-background/50 p-3 rounded-2xl border border-border/50">
                        {booking.problem_description}
                      </p>
                    )}
                  </div>

                  {/* Botones de Acción */}
                  {!isEditing && (
                    <div className="flex gap-2 pt-1 border-t border-border">
                      <button
                        onClick={() => handleStartEdit(booking)}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground hover:border-navy/30 disabled:opacity-50"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-navy" />
                        Editar problema
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-red-200 bg-card py-2.5 text-xs font-semibold text-red-600 hover:border-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        {isBusy ? "Cancelando…" : "Cancelar reserva"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
