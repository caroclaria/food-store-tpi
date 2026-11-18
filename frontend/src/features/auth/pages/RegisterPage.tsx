import { useState } from "react";
import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { handleApiError } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/Input";
import {
  errorDeCampo,
  textoRequerido,
  validarEmail,
  validarPassword,
  validarUsername,
} from "@/shared/utils/validators";
import * as authApi from "../api/authApi";
import AuthCard from "../components/AuthCard";

function RegisterPage() {
  const login = useAuthStore((s) => s.login);
  const mostrar = useNotificationStore((s) => s.mostrar);
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "", confirmar: "" },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      try {
        await authApi.register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        // Registro exitoso: se inicia la sesión directamente.
        await login(value.username.trim(), value.password);
        mostrar("¡Cuenta creada! Ya podés hacer tu pedido.");
        navigate("/", { replace: true });
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
      titulo="Creá tu cuenta"
      subtitulo="Te lleva un minuto y después pedís cuando quieras."
      pie={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-bold text-rosa-700 hover:underline">
            Ingresá
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <form.Field name="username" validators={{ onChange: ({ value }) => validarUsername(value) }}>
          {(field) => (
            <TextField
              id="username"
              label="Usuario"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="username"
              hint="Entre 3 y 50 caracteres: letras, números y . _ -"
              autoFocus
              required
            />
          )}
        </form.Field>

        <form.Field
          name="full_name"
          validators={{ onChange: ({ value }) => textoRequerido(2, 100)(value) }}
        >
          {(field) => (
            <TextField
              id="full_name"
              label="Nombre completo"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="name"
              required
            />
          )}
        </form.Field>

        <form.Field name="email" validators={{ onChange: ({ value }) => validarEmail(value) }}>
          {(field) => (
            <TextField
              id="email"
              label="Email"
              type="email"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="email"
              required
            />
          )}
        </form.Field>

        <form.Field name="password" validators={{ onChange: ({ value }) => validarPassword(value) }}>
          {(field) => (
            <TextField
              id="password"
              label="Contraseña"
              type="password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="new-password"
              hint="Mínimo 8 caracteres"
              required
            />
          )}
        </form.Field>

        <form.Field
          name="confirmar"
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) =>
              value !== fieldApi.form.getFieldValue("password") ? "Las contraseñas no coinciden" : undefined,
          }}
        >
          {(field) => (
            <TextField
              id="confirmar"
              label="Repetí la contraseña"
              type="password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="new-password"
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
              Crear cuenta
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}

export default RegisterPage;
