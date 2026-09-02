import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const AiVoiceAssistant = dynamic(
  () => import('@/components/AiVoiceAssistant').then((mod) => mod.AiVoiceAssistant),
  { ssr: false, loading: () => null }
);

export const metadata: Metadata = {
  title: 'Aryan Tracker',
  description: "Aryan's personal command center with an AI assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main className="page-main flex-1 overflow-y-auto" style={{ padding: '24px 20px', minWidth: 0 }}>
            {children}
          </main>
        </div>
        <AiVoiceAssistant />
      </body>
    </html>
  );
}
