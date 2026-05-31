import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ru } from "@/lib/i18n/ru";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { resolvedDisplayTheme, setTheme } = useTheme();
  const nextTheme = resolvedDisplayTheme === "dark" ? "light" : "dark";

  return (
    <Button variant="outline" size="sm" onClick={() => setTheme(nextTheme)}>
      {resolvedDisplayTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="ml-2">{ru.theme.toggle}</span>
    </Button>
  );
}
