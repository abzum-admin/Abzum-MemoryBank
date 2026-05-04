import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "No modules installed",
  description = "Install your first module to get started. Hermes agent, cloudflared, and more are ready to deploy.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-elevated/40 px-8 py-16 text-center">
      {/* Icon container with gradient ring */}
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/20">
          <PackagePlus className="h-8 w-8 text-accent" />
        </div>
        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl blur-xl bg-accent/15" />
      </div>

      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">{description}</p>

      <div className="mt-6 flex gap-3">
        <Button asChild size="sm">
          <Link href="/install">
            <PackagePlus className="mr-2 h-4 w-4" />
            Install Module
          </Link>
        </Button>
      </div>
    </div>
  );
}
