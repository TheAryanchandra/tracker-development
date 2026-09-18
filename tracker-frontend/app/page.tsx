import PortfolioClient from '@/components/PortfolioClient';

// Enable Next.js Incremental Static Regeneration (ISR)
export const revalidate = 60;

export default async function Page() {
  let initialStats = null;
  let initialPortfolio = null;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
    const [statsRes, portfolioRes] = await Promise.all([
      fetch(`${backendUrl}/dashboard/stats`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => null),
      fetch(`${backendUrl}/portfolio`, { next: { revalidate: 60 } }).then(r => r.json()).catch(() => null),
    ]);

    if (statsRes?.success && statsRes?.data) {
      initialStats = statsRes.data;
    }
    if (portfolioRes?.success && portfolioRes?.portfolio) {
      initialPortfolio = portfolioRes.portfolio;
    }
  } catch (err) {
    console.warn('[ISR Page] Could not fetch static pre-render data during build, using fallbacks:', err);
  }

  return <PortfolioClient initialStats={initialStats} initialPortfolio={initialPortfolio} />;
}