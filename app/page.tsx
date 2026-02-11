import { SubscriptionButtons } from "@/components/features/home/subscription-buttons";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div className="w-full h-svh flex items-center justify-center">
      Home page Hello World
      <SubscriptionButtons />
    </div>

  );
}
