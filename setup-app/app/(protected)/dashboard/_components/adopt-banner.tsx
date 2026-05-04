"use client";

import { useState } from "react";
import { PackageSearch, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdoptableContainer {
  id: string;
  name: string;
  imageId: string;
}

/**
 * Shown at the top of the dashboard when Docker containers are detected that
 * look like known module instances but aren't tracked in the installations
 * table. Lets the user adopt them into the setup app without re-deploying.
 */
export function AdoptBanner({
  containers,
}: {
  containers: AdoptableContainer[];
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded p-1 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <PackageSearch className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            Existing services detected
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {containers.length} container
            {containers.length !== 1 ? "s" : ""} found on this host that
            {containers.length !== 1 ? " aren't" : " isn't"} managed by this
            setup app yet. Adopt{" "}
            {containers.length !== 1 ? "them" : "it"} to track health, manage
            Doppler secrets, and enable one-click uninstall.
          </p>

          <ul className="mt-2 space-y-1">
            {containers.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-2 text-xs text-text-muted"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                <span className="font-mono font-medium text-text-secondary">
                  {c.name}
                </span>
                <span className="truncate text-text-muted">({c.imageId})</span>
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/adopt">
                Adopt services
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
