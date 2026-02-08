import { authClient } from "@/lib/auth-client"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"


export const useSafeLogout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)

  const logout = async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
      queryClient.clear()
      toast.success("ログアウトしました")
      
      // キャッシュ対策でリロード
      router.replace("/sign-in")
      router.refresh();

    } catch (error) {
      toast.error("ログアウトに失敗しました")
      
    } finally {
      setIsLoading(false)
    }
  }

  return {
    logout,
    isLoading,
  }
}