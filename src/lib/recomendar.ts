import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

export const GEMINI_MODEL = "gemini-3.8-flash";

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

export const recomendarExperto = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<RecomendacionResponse> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        error: "El servicio de recomendación no está configurado en este momento.",
      };
    }

    try {
     
      const { data: experts, error: dbError } = await supabase
        .from("developers")
        .select("id, full_name, specialty, price_cop, short_bio, tech");

      if (dbError || !experts || experts.length === 0) {
        return {
          error: "No pudimos consultar la lista de expertos disponibles. Intenta más tarde.",
        };
      }

    
      const expertsContext = experts.map((e) => ({
        id: e.id,
        nombre: e.full_name,
        especialidad: e.specialty,
        precio_cop: new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0,
        }).format(Number(e.price_cop)),
        resumen: e.short_bio,
        tecnologias: e.tech,
      }));

 
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        console.error("Gemini error:", response.status, await response.text());
        return {
          error: "No pudimos conectar con el asistente en este momento. Intenta de nuevo.",
        };
      }

      const geminiData = await response.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return {
          error: "El asistente no pudo generar una respuesta. Intenta describir tu problema de otra forma.",
        };
      }

    
      const cleanedJson = rawText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanedJson) as {
        expertId?: string | null;
        mensaje?: string;
      };

      if (typeof parsed.mensaje !== "string" || !parsed.mensaje.trim()) {
        return {
          error: "Recibimos una respuesta inesperada del asistente. Intenta nuevamente.",
        };
      }

      
      const isValidExpert =
        typeof parsed.expertId === "string" &&
        experts.some((exp) => exp.id === parsed.expertId);

      return {
        expertId: isValidExpert ? parsed.expertId! : null,
        mensaje: parsed.mensaje.trim(),
      };
    } catch {
      return {
        error: "Ocurrió un problema inesperado al analizar tu consulta. Intenta de nuevo.",
      };
    }
  });
