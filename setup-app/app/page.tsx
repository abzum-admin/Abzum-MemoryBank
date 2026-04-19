import { redirect } from "next/navigation";
import { isBootstrapped } from "@/lib/auth/bootstrap-state";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  // Bootstrap gate: first-run sends operator through the wizard; after that,
  // the dashboard becomes the home page.
  if (!(await isBootstrapped())) {
    redirect("/bootstrap");
  }
  redirect("/dashboard");
}
