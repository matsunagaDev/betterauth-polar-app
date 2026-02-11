import { authClient } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"


export const GetSubscription = () => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const {data} = await authClient.customer.state()
      return data
    }
  });
}

export const UseActiveSubscription = () => {
  const {data, isLoading, ...rest} = GetSubscription()
  // boolean to check if the user has an active subscription
  const isActiveSubscription = data?.activeSubscriptions && data?.activeSubscriptions.length > 0;

  return {
    data,
    isActiveSubscription,
    isLoading,
    subscription: data?.activeSubscriptions?.[0],
    ...rest
  }
}