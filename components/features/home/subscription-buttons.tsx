'use client';
import { CreditCardIcon, ListIcon, LogOutIcon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useSafeLogout } from '@/hooks/use-safe-logout';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UseActiveSubscription } from '@/hooks/use-active-subscription';

export const SubscriptionButtons = () => {
  const { logout, isLoading: loadingLogout } = useSafeLogout();
  const { isActiveSubscription, isLoading, subscription, data } =
    UseActiveSubscription();

  return (
    <div className="flex flex-col justify-center items-center">
      {/* サブスクリプションボタン */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Polar Checkout
            <CardDescription>
              <Badge
                className="w-full p-2 rounded-lg"
                variant={!isActiveSubscription ? 'default' : 'destructive'}
              >
                {!isActiveSubscription ? 'Free Plan' : 'Pro Plan'}
              </Badge>
            </CardDescription>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="w-full flex flex-col justify-center items-center gap-y-4">
            {!isActiveSubscription && !isLoading && (
              <Button
                disabled={false}
                onClick={() =>
                  authClient.checkout({
                    slug: 'test-product',
                  })
                }
                className="w-full"
              >
                <CreditCardIcon className="size-4" />
                <span>Subscribe to the Premium Plan</span>
              </Button>
            )}
            <Button
              disabled={false}
              onClick={() => authClient.customer.portal()}
              className="w-full"
            >
              <ListIcon className="size-4" />
              <span>Check Portal</span>
            </Button>
            <Button disabled={false} onClick={logout} className="w-full">
              <ListIcon className="size-4" />
              <span>Logout</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="w-full max-w-[600px]">
        <p>{JSON.stringify(data, null, 2)}</p>
      </div>
    </div>
  );
};
