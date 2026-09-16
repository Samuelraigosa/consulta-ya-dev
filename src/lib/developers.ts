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

export const developers: Developer[] = [
  {
    id: "santiago-ospina",
    name: "Santiago Ospina",
    specialty: "React y frontend",
    shortBio: "Desbloqueo errores de React, hooks y estado en minutos.",
    bio: "Soy desarrollador frontend con más de 7 años de experiencia construyendo aplicaciones con React y TypeScript. Me encanta resolver esos errores enredados de hooks, renderizados infinitos y problemas de estado que te quitan el sueño. Trabajo rápido, explico claro y te dejo el código funcionando con buenas prácticas.",
    photo: santiagoImg,
    tech: ["React", "TypeScript", "Next.js", "Tailwind", "Redux", "Vite"],
    priceFrom: 45000,
    slots: [
      { id: "s1", label: "Hoy 2:00 p.m.", day: "Hoy", duration: 30, price: 45000 },
      { id: "s2", label: "Hoy 4:00 p.m.", day: "Hoy", duration: 30, price: 45000 },
      { id: "s3", label: "Hoy 6:30 p.m.", day: "Hoy", duration: 30, price: 45000 },
      { id: "s4", label: "Mañana 9:00 a.m.", day: "Mañana", duration: 30, price: 45000 },
      { id: "s5", label: "Mañana 10:30 a.m.", day: "Mañana", duration: 30, price: 45000 },
      { id: "s6", label: "Mañana 3:00 p.m.", day: "Mañana", duration: 30, price: 45000 },
    ],
  },
  {
    id: "valeria-cardona",
    name: "Valeria Cardona",
    specialty: "Bases de datos",
    shortBio: "Consultas lentas, modelos y migraciones sin dolor de cabeza.",
    bio: "Ingeniera de sistemas especializada en bases de datos relacionales y NoSQL. Si tu consulta SQL tarda una eternidad, tu migración se rompió o no sabes cómo modelar tus datos, yo te ayudo. He optimizado bases de datos para startups y empresas en toda Colombia, siempre con explicaciones sencillas y soluciones que duran.",
    photo: valeriaImg,
    tech: ["PostgreSQL", "MySQL", "MongoDB", "Prisma", "Redis", "Supabase"],
    priceFrom: 50000,
    slots: [
      { id: "v1", label: "Hoy 3:00 p.m.", day: "Hoy", duration: 30, price: 50000 },
      { id: "v2", label: "Hoy 5:00 p.m.", day: "Hoy", duration: 30, price: 50000 },
      { id: "v3", label: "Mañana 8:30 a.m.", day: "Mañana", duration: 30, price: 50000 },
      { id: "v4", label: "Mañana 11:00 a.m.", day: "Mañana", duration: 30, price: 50000 },
      { id: "v5", label: "Mañana 2:00 p.m.", day: "Mañana", duration: 30, price: 50000 },
    ],
  },
  {
    id: "mateo-zuluaga",
    name: "Mateo Zuluaga",
    specialty: "Despliegue y DevOps",
    shortBio: "Despliegues que fallan, pipelines rotos y servidores caídos.",
    bio: "Ingeniero DevOps con amplia experiencia en AWS, Docker y pipelines de CI/CD. Si tu despliegue falla y no entiendes el error, tu servidor se cayó un viernes en la noche o tu pipeline lleva roto una semana, hablamos y lo dejamos andando. También te dejo recomendaciones para que no vuelva a pasar.",
    photo: mateoImg,
    tech: ["AWS", "Docker", "Vercel", "GitHub Actions", "Nginx", "Kubernetes"],
    priceFrom: 60000,
    slots: [
      { id: "m1", label: "Hoy 1:30 p.m.", day: "Hoy", duration: 30, price: 60000 },
      { id: "m2", label: "Hoy 4:30 p.m.", day: "Hoy", duration: 30, price: 60000 },
      { id: "m3", label: "Hoy 7:00 p.m.", day: "Hoy", duration: 30, price: 60000 },
      { id: "m4", label: "Mañana 10:00 a.m.", day: "Mañana", duration: 30, price: 60000 },
      { id: "m5", label: "Mañana 4:00 p.m.", day: "Mañana", duration: 30, price: 60000 },
    ],
  },
  {
    id: "andres-restrepo",
    name: "Andrés Restrepo",
    specialty: "WordPress y PHP",
    shortBio: "Plugins, temas y errores de WordPress resueltos al instante.",
    bio: "Desarrollador WordPress y PHP con más de 10 años de experiencia. Pantallas blancas de la muerte, plugins que se pelean entre sí, temas que se dañan con una actualización: lo he visto todo y lo soluciono rápido. Ideal para dueños de sitios y agencias que necesitan respuestas ya, no la próxima semana.",
    photo: andresImg,
    tech: ["WordPress", "PHP", "WooCommerce", "Elementor", "MySQL", "cPanel"],
    priceFrom: 35000,
    slots: [
      { id: "a1", label: "Hoy 2:30 p.m.", day: "Hoy", duration: 15, price: 35000 },
      { id: "a2", label: "Hoy 3:30 p.m.", day: "Hoy", duration: 15, price: 35000 },
      { id: "a3", label: "Hoy 5:30 p.m.", day: "Hoy", duration: 15, price: 35000 },
      { id: "a4", label: "Mañana 9:30 a.m.", day: "Mañana", duration: 15, price: 35000 },
      { id: "a5", label: "Mañana 11:30 a.m.", day: "Mañana", duration: 15, price: 35000 },
      { id: "a6", label: "Mañana 3:30 p.m.", day: "Mañana", duration: 15, price: 35000 },
    ],
  },
];

export const getDeveloper = (id: string) =>
  developers.find((d) => d.id === id);
