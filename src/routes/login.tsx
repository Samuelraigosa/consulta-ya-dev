import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const searchSchema = z.object({
  redirect: z.string().optional().default("/"),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Consulta Ya" },
      {
        name: "description",
        content: "Inicia sesión o crea tu cuenta en Consulta Ya para gestionar tus asesorías técnicas.",
      },
      { property: "og:title", content: "Iniciar sesión — Consulta Ya" },
      {
        property: "og:description",
        content: "Inicia sesión o crea tu cuenta en Consulta Ya.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LoginPage,
});

function getSafeRedirect(rawRedirect?: string): string {
  if (!rawRedirect) return "/";
  const trimmed = rawRedirect.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  return "/";
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "El correo o la contraseña son incorrectos.";
  }
  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered")
  ) {
    return "Este correo ya está registrado. Intenta iniciar sesión.";
  }
  if (lower.includes("password") && lower.includes("6")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("fetch")
  ) {
    return "No pudimos conectarnos. Revisa tu conexión a internet e intenta de nuevo.";
  }

  return "No pudimos completar la solicitud. Verifica tus datos e intenta de nuevo.";
}

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const safeRedirect = getSafeRedirect(redirect);

  // Redirigir automáticamente si el usuario ya tiene sesión activa
  useEffect(() => {
    if (!sessionLoading && user) {
      router.history.push(safeRedirect);
    }
  }, [sessionLoading, user, safeRedirect, router]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleToggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const cleanEmail = email.trim();

    if (!isEmailValid) {
      setErrorMsg("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setInfoMsg(null);

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMsg(mapAuthError(error.message));
          return;
        }

        router.history.push(safeRedirect);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMsg(mapAuthError(error.message));
          return;
        }

        if (data.session) {
          router.history.push(safeRedirect);
        } else {
          // En caso de que Supabase tenga confirmación por correo activada
          setInfoMsg(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta y luego inicia sesión."
          );
          setMode("login");
        }
      }
    } catch (err: any) {
      setErrorMsg(mapAuthError(err?.message || ""));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-10">
      <header className="rounded-b-3xl bg-navy px-5 pb-8 pt-6 text-primary-foreground">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </button>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p className="mt-1 text-sm text-primary-foreground/75">
          {mode === "login"
            ? "Accede para agendar y gestionar tus asesorías técnicas."
            : "Regístrate en segundos para reservar tu primera consulta."}
        </p>
      </header>

      <div className="space-y-5 px-5 pt-6">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-3xl border border-border bg-card p-5"
        >
          <div>
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-sm font-bold text-foreground"
            >
              <Mail className="h-4 w-4 text-navy" />
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="mt-2.5 w-full rounded-2xl border border-border bg-background p-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-success focus:ring-2 focus:ring-success/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="flex items-center gap-2 text-sm font-bold text-foreground"
            >
              <Lock className="h-4 w-4 text-navy" />
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="mt-2.5 w-full rounded-2xl border border-border bg-background p-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-success focus:ring-2 focus:ring-success/30"
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="mt-2 w-full rounded-2xl bg-success py-3.5 text-sm font-extrabold text-success-foreground shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? mode === "login"
                ? "Entrando…"
                : "Creando cuenta…"
              : mode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-xs font-semibold text-navy/80 hover:text-navy hover:underline"
            >
              {mode === "login"
                ? "¿No tienes cuenta? Crea una aquí"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </form>

        {errorMsg && (
          <p className="rounded-2xl border border-dashed border-red-300 bg-card p-4 text-center text-xs text-red-500">
            {errorMsg}
          </p>
        )}

        {infoMsg && (
          <p className="rounded-2xl border border-success/40 bg-card p-4 text-center text-xs font-medium text-foreground">
            {infoMsg}
          </p>
        )}
      </div>
    </div>
  );
}
