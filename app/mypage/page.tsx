import { SubscriptionButtons } from '@/components/features/home/subscription-buttons';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const session = await auth.api.getSession({
    // ヘッダーを取得
    headers: await headers(),
  });

  // セッションがない場合はサインインページにリダイレクト
  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-6">
      <SubscriptionButtons />
    </div>
  );
}
