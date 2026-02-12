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

const formSchema = z
  .object({
    name: z.string().min(1, { message: "名前を入力してください" }),
    email: z.email("有効なメールアドレスを入力してください"),
    password: z.string().min(1, { message: "パスワードを入力してください" }),
    confirmPassword: z.string().min(1, { message: "確認用パスワードを入力してください" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export function SignUpView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // メール/パスワード認証
  const handleEmailSignUp = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setIsLoading(true);

    await authClient.signUp.email(
      {
        name: data.name,
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
  const handleGitHubSignUp = async () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>サインアップ</CardTitle>
        <CardDescription>
          新しいアカウントを作成してください
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

          {/* メール/パスワード */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailSignUp)}>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名前</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="山田 太郎"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your-email@gmail.com"
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
                          placeholder="パスワードを入力"
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>確認用パスワード</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="確認用パスワードを入力"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "処理中..." : "サインアップ"}
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
              onClick={handleGitHubSignUp}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHubでサインアップ
            </Button>
          </Field>

          <FieldSeparator />

          <Field>
            <FieldDescription className="text-center">
              既にアカウントをお持ちの方は{" "}
              <Link href="/sign-in" className="text-primary underline underline-offset-4 hover:text-primary/80">
                サインイン
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
