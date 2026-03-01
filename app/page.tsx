import { SubscriptionButtons } from "@/components/features/home/subscription-buttons";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schemas/auth";
import { eq } from "drizzle-orm";

export default async function Home() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  // 匿名ユーザー以外でオンボーディング未完了ならリダイレクト
  if (!session.user.isAnonymous) {
    const user = await db
      .select({ onboardingCompleted: users.onboardingCompleted })
      .from(users)
      .where(eq(users.id, session.user.id))
      .get();

    if (!user?.onboardingCompleted) {
      redirect("/onboarding");
    }
  }

  return (
    <div className="w-full h-svh flex items-center justify-center">
      Home page Hello World
      <SubscriptionButtons />
    </div>

  );
}
