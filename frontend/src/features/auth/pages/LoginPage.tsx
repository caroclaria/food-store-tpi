import { useState } from "react";
import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { handleApiError } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/Input";
import { errorDeCampo } from "@/shared/utils/validators";
import AuthCard from "../components/AuthCard";

interface LocationState {
  from?: string;
}

function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const mostrar = useNotificationStore((s) => s.mostrar);
  const navigate = useNavigate();
  const location = useLocation();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const destino = (location.state as LocationState | null)?.from;

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      try {
        const user = await login(value.username.trim(), value.password);
        mostrar(`¡Hola, ${user.full_name}!`);
        navigate(destino ?? (user.role === "admin" ? "/admin/resumen" : "/"), { replace: true });
      } catch (error) {
        setErrorApi(handleApiError(error));
      }
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <AuthCard
      titulo="¡Qué bueno verte!"
      subtitulo="Ingresá con tu usuario para hacer tu pedido."
      pie={
        <>
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-bold text-rosa-700 hover:underline">
            Registrate
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : "El usuario es obligatorio") }}
        >
          {(field) => (
            <TextField
              id="username"
              label="Usuario"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="username"
              autoFocus
              required
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (value ? undefined : "La contraseña es obligatoria") }}
        >
          {(field) => (
            <TextField
              id="password"
              label="Contraseña"
              type="password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="current-password"
              required
            />
          )}
        </form.Field>

        {errorApi && (
          <p role="alert" className="rounded-xl bg-rosa-50 p-3 text-sm font-semibold text-rosa-800 ring-1 ring-rosa-200">
            {errorApi}
          </p>
        )}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" size="lg" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}

export default LoginPage;
