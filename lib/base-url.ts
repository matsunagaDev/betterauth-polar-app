export const baseUrl = (options?: { useCommitURL?: boolean }) => {
  // 本番環境かどうかを判断する
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
  // 本番環境の場合は、NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URLを使用する
  // 開発環境の場合は、NEXT_PUBLIC_VERCEL_URLを使用する
  // ブランチ環境の場合は、NEXT_PUBLIC_VERCEL_BRANCH_URLを使用する
  const url = isProd
    ? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    : options?.useCommitURL
      ? process.env.NEXT_PUBLIC_VERCEL_URL
      : process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;

  // 本番環境の場合は、https://${url}を使用する
  // 開発環境の場合は、http://localhost:${process.env.NEXT_PUBLIC_PORT || 3000}を使用する
  // ブランチ環境の場合は、http://localhost:${process.env.NEXT_PUBLIC_PORT || 3000}を使用する
  return url
    ? `https://${url}`
    : `http://localhost:${process.env.NEXT_PUBLIC_PORT || 3000}`;
};
