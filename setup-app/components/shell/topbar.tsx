import { Bell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Topbar({ title, description, children }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-elevated/50 px-6 backdrop-blur-sm">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-text-primary">{title}</h1>
        {description && (
          <p className="truncate text-xs text-text-muted">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {children}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
