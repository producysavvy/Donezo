"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthMode = "login" | "signup" | "forgot" | "reset";

type AuthFormProps = {
  mode: AuthMode;
};

const copy = {
  login: {
    title: "Sign in",
    action: "Sign in",
    endpoint: "/api/auth/login",
  },
  signup: {
    title: "Create account",
    action: "Create account",
    endpoint: "/api/auth/signup",
  },
  forgot: {
    title: "Reset password",
    action: "Send reset token",
    endpoint: "/api/auth/forgot-password",
  },
  reset: {
    title: "Set new password",
    action: "Update password",
    endpoint: "/api/auth/reset-password",
  },
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setNotice(null);

    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(copy[mode].endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json()) as {
      error?: { message: string };
      data?: unknown;
    };

    setPending(false);

    if (!response.ok) {
      setError(body.error?.message ?? "Request failed");
      return;
    }

    if (mode === "login" || mode === "signup") {
      router.push("/app");
      router.refresh();
      return;
    }

    setNotice(
      mode === "forgot"
        ? "If the account exists, a reset token was sent through the email adapter."
        : "Password updated. You can sign in again.",
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <section className="w-full max-w-md rounded border border-line bg-white p-8 shadow-soft">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Donezo
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">
            {copy[mode].title}
          </h1>
        </div>

        <form action={onSubmit} className="space-y-4">
          {mode === "signup" ? (
            <>
              <Field label="Name" name="name" autoComplete="name" />
              <Field
                label="Workspace name"
                name="organizationName"
                autoComplete="organization"
              />
            </>
          ) : null}

          {(mode === "login" || mode === "signup" || mode === "forgot") ? (
            <Field label="Email" name="email" type="email" autoComplete="email" />
          ) : null}

          {mode === "reset" ? (
            <Field label="Reset token" name="token" autoComplete="off" />
          ) : null}

          {mode !== "forgot" ? (
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Working..." : copy[mode].action}
          </button>
        </form>

        <nav className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
          {mode !== "login" ? <Link href="/login">Sign in</Link> : null}
          {mode !== "signup" ? <Link href="/signup">Create account</Link> : null}
          {mode !== "forgot" ? (
            <Link href="/forgot-password">Forgot password</Link>
          ) : null}
          {mode === "forgot" ? <Link href="/reset-password">Enter token</Link> : null}
        </nav>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
};

function Field({ label, name, type = "text", autoComplete }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-ink">
      <span>{label}</span>
      <input
        className="mt-2 w-full rounded border border-line px-3 py-2 outline-none focus:border-brand"
        name={name}
        type={type}
        autoComplete={autoComplete}
      />
    </label>
  );
}
