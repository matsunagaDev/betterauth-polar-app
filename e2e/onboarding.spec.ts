import { test, expect } from "@playwright/test";

test.describe("オンボーディング", () => {
  test("未認証ユーザーはサインインページにリダイレクトされる", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("オンボーディング画面にジャンル一覧が表示される", async ({ page }) => {
    // TODO: 認証済みユーザーでログインした状態でテスト
    // 認証のセットアップが必要（セッション Cookie の設定等）
    test.skip();
  });

  test("ジャンルは最大3つまで選択できる", async ({ page }) => {
    test.skip();
  });

  test("ジャンルを選択して完了するとメインページに遷移する", async ({
    page,
  }) => {
    test.skip();
  });

  test("スキップするとメインページに遷移する", async ({ page }) => {
    test.skip();
  });
});
