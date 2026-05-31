import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import type { FormEvent } from "react";
import { ru } from "@/lib/i18n/ru";

export function LoginPage() {
  const { login, isLoginLoading, loginError, clearLoginError } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearLoginError();
    await login(loginValue, password);
  };

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-lg border border-border bg-background p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{ru.login.title}</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          placeholder={ru.login.loginPlaceholder}
          type="text"
          value={loginValue}
          onChange={(event) => setLoginValue(event.target.value)}
          required
          autoComplete="username"
        />
        <Input
          placeholder={ru.login.passwordPlaceholder}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
        />
        {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
        <Button type="submit" className="w-full" disabled={isLoginLoading}>
          {isLoginLoading ? ru.login.submitting : ru.login.submit}
        </Button>
      </form>
    </section>
  );
}
