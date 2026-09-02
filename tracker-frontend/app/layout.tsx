import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { AiVoiceAssistant } from '@/components/AiVoiceAssistant';

export const metadata: Metadata = {
  title: 'Daily Tracker — Aryan Chandra',
  description: 'Personal career & DSA tracking dashboard with AI assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#080b0f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main
            className="page-main flex-1 overflow-y-auto"
            style={{ padding: '24px 20px', minWidth: 0 }}
          >
            {children}
          </main>
        </div>
        <AiVoiceAssistant />
      </body>
    </html>
  );
}
