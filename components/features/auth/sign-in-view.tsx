"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon, Github } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const formSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, { message: "パスワードを入力してください" }),
});

export function SignInView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ゲストログイン
  const handleGuestSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authClient.signIn.anonymous();
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ゲストログインに失敗しました";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // メール/パスワード認証フォーム
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // メール/パスワード認証
  const handleEmailSignIn = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setIsLoading(true);

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          form.reset();
          router.push("/");
        },
        onError: ({ error }) => {
          toast.error(error.message);
          setError(error.message);
          setIsLoading(false);
        },
      }
    );
  };

  // GitHub認証
  const handleGitHubSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "GitHub認証に失敗しました";
      toast.error(errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Google認証
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Google認証に失敗しました";
      toast.error(errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>サインイン</CardTitle>
        <CardDescription>
          アカウントにサインインしてください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <OctagonAlertIcon className="size-4" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          {/* ゲストログイン */}
          <Field>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGuestSignIn}
              disabled={isLoading}
            >
              ゲストとして続ける
            </Button>
          </Field>

          <FieldSeparator>または</FieldSeparator>

          {/* メール/パスワード */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailSignIn)}>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>パスワード</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "処理中..." : "サインイン"}
                </Button>
              </FieldGroup>
            </form>
          </Form>

          <FieldSeparator>または</FieldSeparator>

          {/* GitHub認証 */}
          <Field>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGitHubSignIn}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHubでサインイン
            </Button>
          </Field>

          {/* Google認証 */}
          <Field>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Googleでサインイン
            </Button>
          </Field>

          <FieldSeparator />

          <Field>
            <FieldDescription className="text-center">
              アカウントをお持ちでない方は{" "}
              <Link href="/sign-up" className="text-primary underline underline-offset-4 hover:text-primary/80">
                サインアップ
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
