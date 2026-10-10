import type { Metadata } from 'next';
import GlacierPortfolio from '@/components/portfolio/GlacierPortfolio';

export const metadata: Metadata = {
  title: 'Aryan Chandra // Systems Architecture & Production Portfolio',
  description:
    'Interactive 3D Glacier profile showcasing Aryan Chandra\'s distributed systems engineering, Project Loom virtual threads, AI agents, and 10,000+ mobile downloads.',
};

export default function ProfilePage() {
  return <GlacierPortfolio />;
}
