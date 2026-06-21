import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/auth-context";
import { ru } from "@/lib/i18n/ru";
import { ClipboardCopy, ClipboardPaste } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

const DEMO_LOGIN = "diplom";
const DEMO_PASSWORD = "diplom123";

export function LoginPage() {
  const { login, isLoginLoading, loginError, clearLoginError } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearLoginError();
    await login(loginValue, password);
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(ru.login.demoCopied);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  const fillDemoCredentials = () => {
    setLoginValue(DEMO_LOGIN);
    setPassword(DEMO_PASSWORD);
    clearLoginError();
    toast.success(ru.login.demoFilled);
  };

  const applyCredential = async (kind: "login" | "password") => {
    const value = kind === "login" ? DEMO_LOGIN : DEMO_PASSWORD;
    if (kind === "login") {
      setLoginValue(value);
    } else {
      setPassword(value);
    }
    clearLoginError();
    await copyText(value);
  };

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-lg border border-border bg-background p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{ru.login.title}</h1>

      <aside className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-4 text-sm">
        <p className="font-medium">{ru.login.demoHintTitle}</p>
        <p className="mt-1 text-muted-foreground">{ru.login.demoHintDescription}</p>

        <dl className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{ru.login.demoLoginLabel}</dt>
            <dd className="flex items-center gap-1">
              <button
                type="button"
                className="rounded bg-background px-2 py-1 font-mono text-sm hover:bg-accent"
                onClick={() => void applyCredential("login")}
                title="Скопировать и вставить логин"
              >
                {DEMO_LOGIN}
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => void copyText(DEMO_LOGIN)}
                aria-label="Скопировать логин"
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </dd>
          </div>

          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{ru.login.demoPasswordLabel}</dt>
            <dd className="flex items-center gap-1">
              <button
                type="button"
                className="rounded bg-background px-2 py-1 font-mono text-sm hover:bg-accent"
                onClick={() => void applyCredential("password")}
                title="Скопировать и вставить пароль"
              >
                {DEMO_PASSWORD}
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => void copyText(DEMO_PASSWORD)}
                aria-label="Скопировать пароль"
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </dd>
          </div>
        </dl>

        <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={fillDemoCredentials}>
          <ClipboardPaste className="mr-2 h-4 w-4" />
          {ru.login.demoFillForm}
        </Button>
      </aside>

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
