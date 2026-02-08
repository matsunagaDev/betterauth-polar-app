import { CreditCardIcon, ListIcon, LogOutIcon } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useSafeLogout } from "@/hooks/use-safe-logout"

import { Button} from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


export const SubscriptionButtons = () => {
  const {logout, isLoading: loadingLogout} = useSafeLogout()

  return (
    <div className="flex flex-col justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>
            <CardDescription>
              <Badge>Free Plan</Badge>
            </CardDescription>
          </CardTitle>
        </CardHeader>
      </Card>  
    </div>
    
  )

}