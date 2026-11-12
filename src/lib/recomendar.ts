import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

// Modelos en orden de preferencia: si el primero falla o está saturado, se prueba el siguiente
export const GEMINI_MODELOS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];

// Cada llamada a Gemini se corta a los 8 segundos para no dejar al usuario esperando
const TIEMPO_LIMITE_MS = 8000;

export const PROMPT_DE_PRODUCTO = `Eres el asistente de Consulta Ya, una plataforma colombiana de consultas técnicas de 15 a 30 minutos. Recomiendas UN experto de la lista que te doy. Usa solo los datos de la lista. NUNCA inventes expertos, precios, horarios ni tecnologías. Si ningún experto sirve para el problema, dilo con amabilidad y no recomiendes ninguno (expertId null). Tono cercano, en español de Colombia, máximo 3 frases. Cuando recomiendes, menciona el nombre, la especialidad y el precio en pesos tal como están en la lista.`;

const inputSchema = z.object({
  problema: z
    .string()
    .trim()
    .min(1, "Por favor escribe tu problema técnico antes de pedir una recomendación.")
    .max(500, "La descripción del problema no puede superar los 500 caracteres."),
});

export type RecomendacionResponse =
  | { expertId: string | null; mensaje: string; error?: never }
  | { error: string; expertId?: never; mensaje?: never };

const formatoCOP = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Plan de respaldo SIN IA: compara el problema con la especialidad y las tecnologías
// de los expertos que están en la base de datos. Solo usa datos reales de la tabla.
function sugerenciaLocal(problema: string, experts: any[]): RecomendacionResponse | null {
  const texto = normalizar(problema);
  let mejor: any = null;
  let mejorPuntaje = 0;

  for (const e of experts) {
    const palabras = new Set<string>();
    (e.tech ?? []).forEach((t: string) => {
      const p = normalizar(String(t));
      if (p.length >= 3) palabras.add(p);
    });
    normalizar(String(e.specialty ?? ""))
      .split(/[^a-z0-9+#.]+/)
      .filter((p) => p.length >= 4)
      .forEach((p) => palabras.add(p));

    let puntaje = 0;
    palabras.forEach((p) => {
      if (texto.includes(p)) puntaje += 1;
    });

    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = e;
    }
  }

  if (!mejor || mejorPuntaje === 0) return null;

  return {
    expertId: mejor.id,
    mensaje: `Ahora mismo el asistente está con mucha demanda, pero según lo que describes te puede ayudar ${mejor.full_name} (${mejor.specialty}), desde ${formatoCOP(Number(mejor.price_cop))}.`,
  };
}

export const recomendarExperto = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<RecomendacionResponse> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        error: "El servicio de recomendación no está configurado en este momento.",
      };
    }

    let experts: any[] = [];

    // Si la IA no responde bien, intentamos el plan de respaldo con datos reales de la base
    const respaldo = (): RecomendacionResponse =>
      sugerenciaLocal(data.problema, experts) ?? {
        error: "No pudimos consultar al asistente en este momento. Intenta de nuevo en unos segundos.",
      };

    try {
      // 1. Obtener expertos reales desde Supabase
      const { data: expertsData, error: dbError } = await supabase
        .from("developers")
        .select("id, full_name, specialty, price_cop, short_bio, tech");

      if (dbError || !expertsData || expertsData.length === 0) {
        return {
          error: "No pudimos consultar la lista de expertos disponibles. Intenta más tarde.",
        };
      }

      experts = expertsData;

      // Formatear lista limpia con precios en COP para evitar alucinaciones numéricas
      const expertsContext = experts.map((e) => ({
        id: e.id,
        nombre: e.full_name,
        especialidad: e.specialty,
        precio_cop: formatoCOP(Number(e.price_cop)),
        resumen: e.short_bio,
        tecnologias: e.tech,
      }));

      // 2. Llamar a la API REST de Gemini desde el servidor, probando los modelos en orden
      const requestBody = JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${PROMPT_DE_PRODUCTO}

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin bloques markdown ni texto adicional:
{
  "expertId": "uuid-del-experto-o-null",
  "mensaje": "tu recomendación en español de Colombia"
}`,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Lista de expertos disponibles:\n${JSON.stringify(expertsContext, null, 2)}\n\nProblema técnico del cliente:\n"${data.problema}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      let respuestaOk: Response | null = null;

      for (const modelo of GEMINI_MODELOS) {
        try {
          const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
              },
              body: requestBody,
              signal: AbortSignal.timeout(TIEMPO_LIMITE_MS),
            },
          );

          if (r.ok) {
            respuestaOk = r;
            break;
          }

          console.error("Gemini error:", modelo, r.status, await r.text());
        } catch (err) {
          console.error("Gemini sin respuesta (red o tiempo):", modelo, String(err));
        }
      }

      if (!respuestaOk) {
        return respaldo();
      }

      const geminiData = await respuestaOk.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return respaldo();
      }

      // 3. Parsear JSON de forma segura (limpiando posibles backticks por precaución)
      const cleanedJson = rawText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanedJson) as {
        expertId?: string | null;
        mensaje?: string;
      };

      if (typeof parsed.mensaje !== "string" || !parsed.mensaje.trim()) {
        return respaldo();
      }

      // 4. Verificación estricta en servidor: el ID debe existir en la tabla developers
      const isValidExpert =
        typeof parsed.expertId === "string" &&
        experts.some((exp) => exp.id === parsed.expertId);

      return {
        expertId: isValidExpert ? parsed.expertId! : null,
        mensaje: parsed.mensaje.trim(),
      };
    } catch {
      return respaldo();
    }
  });
