import santiagoImg from "@/assets/santiago.jpg";
import valeriaImg from "@/assets/valeria.jpg";
import mateoImg from "@/assets/mateo.jpg";
import andresImg from "@/assets/andres.jpg";

export interface TimeSlot {
  id: string;
  label: string;
  day: "Hoy" | "Mañana";
  duration: number;
  price: number;
}

export interface Developer {
  id: string;
  name: string;
  specialty: string;
  shortBio: string;
  bio: string;
  photo: string;
  tech: string[];
  priceFrom: number;
  slots: TimeSlot[];
}

export interface DatabaseDeveloperRow {
  id: string;
  created_at: string;
  full_name: string;
  specialty: string;
  price_cop: number;
  available_slots: string[] | null;
  slot_hours: number[] | null;
  photo: string;
  short_bio: string;
  bio: string;
  tech: string[];
  duration_min: number;
}

const photoByKey: Record<string, string> = {
  santiago: santiagoImg,
  valeria: valeriaImg,
  mateo: mateoImg,
  andres: andresImg,
};

const ZONA_HORARIA = "America/Bogota";

// Fecha en formato YYYY-MM-DD según la hora de Colombia
const fechaColombia = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(date);

// Genera los horarios (en formato ISO) de hoy y de mañana a partir de las horas de atención
// del experto (slot_hours). Colombia no tiene cambio de horario, siempre es UTC-5.
// Si el experto no tiene slot_hours, se usan los horarios fijos de available_slots.
function generarHorarios(row: DatabaseDeveloperRow, now: Date): string[] {
  if (row.slot_hours && row.slot_hours.length > 0) {
    const hoy = fechaColombia(now);
    const manana = fechaColombia(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    const horas = [...row.slot_hours].sort((a, b) => a - b);
    const isos: string[] = [];

    for (const fecha of [hoy, manana]) {
      for (const hora of horas) {
        const hh = String(hora).padStart(2, "0");
        isos.push(new Date(`${fecha}T${hh}:00:00-05:00`).toISOString());
      }
    }
    return isos;
  }

  return row.available_slots ?? [];
}

export const mapRowToDeveloper = (row: DatabaseDeveloperRow): Developer => {
  const now = new Date();
  const todayStr = fechaColombia(now);
  const tomorrowStr = fechaColombia(new Date(now.getTime() + 24 * 60 * 60 * 1000));

  const slots: TimeSlot[] = generarHorarios(row, now)
    .map((slotIso) => {
      const slotDate = new Date(slotIso);

      // Descartar horarios pasados
      if (slotDate <= now) return null;

      const slotDayStr = fechaColombia(slotDate);
      let day: "Hoy" | "Mañana";

      if (slotDayStr === todayStr) {
        day = "Hoy";
      } else if (slotDayStr === tomorrowStr) {
        day = "Mañana";
      } else {
        return null; // Ignorar horarios que no sean de hoy ni de mañana
      }

      // Formatear hora a lenguaje natural en español (ej: "2:00 p.m.")
      const timeFormatted = new Intl.DateTimeFormat("es-CO", {
        timeZone: ZONA_HORARIA,
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(slotDate);

      return {
        id: slotIso,
        label: `${day} ${timeFormatted}`,
        day,
        duration: row.duration_min,
        price: Number(row.price_cop),
      };
    })
    .filter((s): s is TimeSlot => s !== null);

  return {
    id: row.id,
    name: row.full_name,
    specialty: row.specialty,
    shortBio: row.short_bio,
    bio: row.bio,
    photo: photoByKey[row.photo] || photoByKey.santiago,
    tech: row.tech || [],
    priceFrom: Number(row.price_cop),
    slots,
  };
};

export const COP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export const SPECIALTIES = [
  "Todos",
  "React y frontend",
  "Bases de datos",
  "Despliegue y DevOps",
  "WordPress",
] as const;
