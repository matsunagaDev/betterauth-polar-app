import { createAuthClient } from "better-auth/react";
import { baseUrl } from "./base-url";
import { anonymousClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";

/**
 * Better Auth クライアント設定
 * 
 * サーバー側（lib/auth.ts）で設定した認証方法が利用可能
 * - ゲストログイン（anonymousClient プラグインが必要）
 * - メール/パスワード認証（emailAndPassword）
 * - GitHub認証（socialProviders.github）
 */
export const authClient = createAuthClient({
  baseURL: baseUrl(),
  plugins: [
    anonymousClient(), // ゲストログイン用プラグイン
    polarClient()
  ],
});
