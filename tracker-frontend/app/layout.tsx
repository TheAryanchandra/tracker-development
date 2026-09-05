import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

const AiVoiceAssistant = dynamic(
  () => import('@/components/AiVoiceAssistant').then((mod) => mod.AiVoiceAssistant),
  { ssr: false, loading: () => null }
);

export const metadata: Metadata = {
  title: 'Aryan Chandra | Software Engineer (SDE 1 / SWE 1) — Full-Stack, Backend, AI & Mobile',
  description: "Aryan Chandra's portfolio — Software Engineer specializing in Java 21, Spring Boot, Node.js, React, distributed backends, RAG & Agentic AI, and mobile apps for Product-Based Companies, MNCs, GCCs, and Startups.",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main className="page-main flex-1 overflow-y-auto flex flex-col" style={{ minWidth: 0 }}>
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
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
