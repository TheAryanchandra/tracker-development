import type { Metadata } from 'next';
import IglooPortfolio from '@/components/IglooPortfolio';

export const metadata: Metadata = {
  title: 'Aryan Chandra // 3D Glacial Profile & Systems Architecture',
  description:
    'Interactive 3D Igloo experience showcasing Aryan Chandra\'s distributed systems engineering, AI agents, and mobile ecosystem.',
};

export default function ProfilePage() {
  return <IglooPortfolio />;
}
