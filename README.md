# Aplicacion Web

Crea la aplicación web "Consulta Ya", un marketplace para Colombia enfocado en desbloquear problemas técnicos puntuales (15 a 30 min) con desarrolladores expertos.

Diseño e interfaz:
- Mobile-first, profesional y confiable. Paleta en azul oscuro (#0F172A o navy sobrio), blanco y acentos verdes (#10B981) para disponibilidad y llamadas a la acción. Esquinas redondeadas, tipografía limpia y buen espacio en blanco.
- Textos y modismos en español de Colombia, precios en pesos colombianos con formato estándar (ej: $45.000).

3 Pantallas / Vistas principales:
1. Inicio:
   - Saludo cálido y frase clara de propuesta de valor ("Soluciona en 20 minutos ese error técnico que te tiene frenado").
   - Buscador por especialidad técnica y botones/filtros rápidos (React y frontend, Bases de datos, Despliegue y DevOps, WordPress).
   - Lista/tarjetas de desarrolladores disponibles hoy con foto circular, nombre, especialidad técnica, línea corta de descripción, precio desde (ej: Desde $35.000) y badge verde "Disponible hoy". Al hacer clic, navega a su perfil.

2. Perfil del desarrollador:
   - Foto y nombre destacados, bio/descripción completa en un párrafo.
   - Fila de badges pequeños con tecnologías (React, Node, PostgreSQL, Vercel, Docker, etc.).
   - Sección de bloques de horario disponibles hoy y mañana: cada bloque como tarjeta/botón interactivo indicando fecha/hora (ej: "Hoy 4:00 p.m.", "Mañana 10:30 a.m."), duración (15 o 30 min) y precio.
   - Al seleccionar un bloque de horario, avanza a la pantalla de confirmación.

3. Confirmación de reserva:
   - Resumen claro: desarrollador, fecha, hora y duración seleccionada.
   - Desglose de precios en 3 líneas: Valor de la consulta, Comisión de la plataforma (15%) y Total a pagar en negrilla.
   - Campo de texto para describir el problema técnico (placeholder: "Ej: mi despliegue falla y no entiendo el error").
   - Botón grande "Confirmar reserva" que al hacer clic muestre un modal o estado visual de reserva confirmada con instrucciones sencillas (simulado, sin pasarela de pago real).
   - Botón para volver atrás o regresar al inicio.

Datos de ejemplo realistas:
- Santiago Ospina (React y frontend) - $45.000 / 30 min
- Valeria Cardona (Bases de datos) - $50.000 / 30 min
- Mateo Zuluaga (Despliegue y DevOps) - $60.000 / 30 min
- Andrés Restrepo (WordPress y PHP) - $35.000 / 15 min

Exclusiones estrictas: Sin auth/login, sin pasarela real de pagos, sin chat, sin videollamada, sin reviews ni dashboards complejos.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/07e12f0e-d36e-48c3-8735-5af5651e0005).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
