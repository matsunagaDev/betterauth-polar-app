import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schemas/auth';
import { eq } from 'drizzle-orm';
import { OnboardingView } from '@/components/features/onboarding/onboarding-view';

export default async function OnboardingPage() {
  // セッションを取得
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 未認証ユーザーはサインインページへ
  if (!session) {
    redirect('/sign-in');
  }

  // オンボーディング完了済みならメインページへ
  const user = await db
    .select({ onboardingCompleted: users.onboardingCompleted })
    .from(users)
    .where(eq(users.id, session.user.id))
    .get();

  if (user?.onboardingCompleted) {
    redirect('/');
  }

  return <OnboardingView />;
}
