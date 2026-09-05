import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const AiVoiceAssistant = dynamic(
  () => import('@/components/AiVoiceAssistant').then((mod) => mod.AiVoiceAssistant),
  { ssr: false, loading: () => null }
);

export const metadata: Metadata = {
  title: 'Aryan Chandra | Software Engineer — Backend, Full Stack & AI Systems',
  description: "Aryan Chandra's portfolio — Software Engineer with 2+ years production experience building scalable systems, distributed backends, and agentic AI applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main className="page-main flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
            {children}
          </main>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Aryan Chandra',
              jobTitle: 'Software Engineer',
              telephone: '+919205723006',
              email: 'aryanchandra3456@gmail.com',
              url: 'https://github.com/TheAryanchandra',
              sameAs: [
                'https://www.linkedin.com/in/thearyanchandra/',
                'https://github.com/TheAryanchandra',
              ],
            }),
          }}
        />
        <AiVoiceAssistant />
      </body>
    </html>
  );
}
